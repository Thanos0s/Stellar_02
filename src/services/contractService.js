import * as StellarSdk from '@stellar/stellar-sdk';
import { CONFIG } from '../config';
import {
  ContractExecutionError,
  InsufficientBalanceError,
  InvalidDonationError,
  TransactionFailedError,
  NetworkError,
  RPCError,
} from '../utils/errorHandler';
import { walletService } from './walletService';

export class ContractService {
  constructor() {
    this.server = new StellarSdk.SorobanRpc.Server(CONFIG.SOROBAN_RPC_URL);
    this.contractAddress = CONFIG.CONTRACT_ADDRESS;
  }

  /**
   * Get current campaign data (raised, goal, deadline, active)
   */
  async getCampaign() {
    try {
      const contract = new StellarSdk.Contract(this.contractAddress);
      // Use a dummy account for read-only simulation
      const dummyAccount = new StellarSdk.Account(
        'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
        '0'
      );

      const tx = new StellarSdk.TransactionBuilder(dummyAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: CONFIG.NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call('get_campaign'))
        .setTimeout(30)
        .build();

      const response = await this.server.simulateTransaction(tx);

      if (StellarSdk.SorobanRpc.isSimulationError(response)) {
        console.warn('Campaign simulation error:', response.error);
        // Return mock data if contract not yet initialized
        return this._getMockCampaign();
      }

      const result = response.result?.retval;
      if (!result) return this._getMockCampaign();

      return this._parseCampaign(result);
    } catch (error) {
      console.error('getCampaign error:', error);
      // Return mock data on network errors so UI still works
      return this._getMockCampaign();
    }
  }

  /**
   * Get raised amount
   */
  async getRaised() {
    try {
      const contract = new StellarSdk.Contract(this.contractAddress);
      const dummyAccount = new StellarSdk.Account(
        'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
        '0'
      );

      const tx = new StellarSdk.TransactionBuilder(dummyAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: CONFIG.NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call('get_raised'))
        .setTimeout(30)
        .build();

      const response = await this.server.simulateTransaction(tx);

      if (StellarSdk.SorobanRpc.isSimulationError(response)) {
        return 0;
      }

      const retval = response.result?.retval;
      if (!retval) return 0;

      const raised = StellarSdk.scValToNative(retval);
      return Number(raised) / 10_000_000; // Convert stroops to XLM
    } catch (error) {
      console.error('getRaised error:', error);
      return 0;
    }
  }

  /**
   * Donate XLM to the campaign
   * @param {number} amountXLM - Amount in XLM
   */
  async donate(amountXLM) {
    try {
      // Validate wallet connection
      if (!walletService.isConnected()) {
        throw new ContractExecutionError('Please connect your wallet before donating.');
      }

      // Validate amount
      if (!amountXLM || isNaN(amountXLM) || amountXLM <= 0) {
        throw new InvalidDonationError('Donation amount must be greater than 0 XLM.');
      }

      if (amountXLM < CONFIG.MIN_DONATION_XLM) {
        throw new InvalidDonationError(
          `Minimum donation is ${CONFIG.MIN_DONATION_XLM} XLM.`
        );
      }

      const publicKey = walletService.publicKey;

      // Check balance
      const balance = await walletService.getBalance(publicKey);
      const balanceNum = parseFloat(balance);
      // Need amount + ~2 XLM for fees/minimum reserve
      if (balanceNum < amountXLM + 2) {
        throw new InsufficientBalanceError(
          (amountXLM + 2).toFixed(2),
          balanceNum.toFixed(2)
        );
      }

      const amountStroops = Math.floor(amountXLM * 10_000_000);
      const contract = new StellarSdk.Contract(this.contractAddress);

      // Build the transaction
      let account;
      try {
        account = await this.server.getAccount(publicKey);
      } catch (error) {
        throw new RPCError('Could not fetch account from network: ' + error?.message);
      }

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: (parseInt(StellarSdk.BASE_FEE) * 10).toString(), // Higher fee for Soroban
        networkPassphrase: CONFIG.NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            'donate',
            StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
            StellarSdk.nativeToScVal(amountStroops, { type: 'i128' })
          )
        )
        .setTimeout(CONFIG.DEFAULT_TIMEOUT)
        .build();

      // Simulate first
      let simulated;
      try {
        simulated = await this.server.simulateTransaction(tx);
      } catch (error) {
        throw new RPCError('Transaction simulation failed: ' + error?.message);
      }

      if (StellarSdk.SorobanRpc.isSimulationError(simulated)) {
        const errMsg = simulated.error || 'Unknown simulation error';
        if (errMsg.includes('deadline') || errMsg.includes('Deadline')) {
          throw new TransactionFailedError('Campaign deadline has passed.', null);
        }
        throw new TransactionFailedError('Contract simulation failed: ' + errMsg, null);
      }

      // Assemble with simulation results (adds auth + resource fees)
      const assembledTx = StellarSdk.SorobanRpc.assembleTransaction(tx, simulated).build();

      // Sign transaction
      let signedTx;
      try {
        signedTx = await walletService.signTransaction(assembledTx);
      } catch (error) {
        if (error?.message?.includes('rejected') || error?.message?.includes('denied')) {
          throw new ContractExecutionError('Transaction was rejected by wallet.');
        }
        throw error;
      }

      // Submit
      let result;
      try {
        result = await this.server.sendTransaction(signedTx);
      } catch (error) {
        throw new RPCError('Failed to submit transaction: ' + error?.message);
      }

      if (result.status === 'ERROR') {
        throw new TransactionFailedError(
          result.errorResult?.result()?.value()?.switch()?.name || 'Submission error',
          result.hash
        );
      }

      return {
        txHash: result.hash,
        status: result.status,
        amountXLM,
      };
    } catch (error) {
      // Re-throw known error types
      if (
        error instanceof ContractExecutionError ||
        error instanceof NetworkError
      ) {
        throw error;
      }
      console.error('Donate error:', error);
      throw new ContractExecutionError('Donation failed: ' + (error?.message || 'Unknown error'));
    }
  }

  /**
   * Poll transaction until confirmed or failed
   */
  async waitForTransaction(txHash, maxAttempts = 20, intervalMs = 3000) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const tx = await this.server.getTransaction(txHash);

        if (tx.status === StellarSdk.SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
          return { status: 'confirmed', txHash, result: tx };
        }

        if (tx.status === StellarSdk.SorobanRpc.Api.GetTransactionStatus.FAILED) {
          return { status: 'failed', txHash, error: 'Transaction failed on-chain' };
        }

        // Still pending — wait
        await new Promise((r) => setTimeout(r, intervalMs));
      } catch (error) {
        if (i === maxAttempts - 1) {
          return { status: 'unknown', txHash, error: error?.message };
        }
        await new Promise((r) => setTimeout(r, intervalMs));
      }
    }
    return { status: 'timeout', txHash, error: 'Transaction confirmation timed out' };
  }

  /**
   * Parse campaign data from contract return value
   */
  _parseCampaign(retval) {
    try {
      const native = StellarSdk.scValToNative(retval);
      return {
        admin: native.admin || '',
        goal: Number(native.goal || 0) / 10_000_000,
        raised: Number(native.raised || 0) / 10_000_000,
        deadline: Number(native.deadline || 0),
        active: native.active !== false,
      };
    } catch (error) {
      console.error('Parse campaign error:', error);
      return this._getMockCampaign();
    }
  }

  /**
   * Mock campaign data for when contract is not yet deployed/initialized
   */
  _getMockCampaign() {
    return {
      admin: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
      goal: CONFIG.CAMPAIGN_GOAL_XLM,
      raised: 0,
      deadline: CONFIG.CAMPAIGN_DEADLINE_LEDGER,
      active: true,
    };
  }
}

export const contractService = new ContractService();
