import { signTransaction, setAllowed, getAddress } from '@stellar/freighter-api';
import { Horizon, TransactionBuilder, Transaction, Operation, Asset, BASE_FEE, Networks } from '@stellar/stellar-sdk';

// ✅ TESTNET ONLY - Hardcoded to prevent accidental mainnet
const TESTNET_PASSPHRASE = Networks.TESTNET;
const HORIZON_URL = 'https://horizon-testnet.stellar.org';

const server = new Horizon.Server(HORIZON_URL);

const checkConnection = async () => {
  return await setAllowed();
};

const retrievePublicKey = async () => {
  const { address } = await getAddress();
  return address;
};

const getBalance = async () => {
  await setAllowed();
  const { address } = await getAddress();

  try {
    const account = await server.loadAccount(address);
    const xlm = account.balances.find((b) => b.asset_type === 'native');
    return xlm ? xlm.balance : '0';
  } catch (error) {
    // Account not found on testnet (404)
    if (error.response?.status === 404) {
      throw new Error('Account not found. Fund it with Friendbot: https://friendbot.stellar.org/');
    }
    throw error;
  }
};

const sendPayment = async (destinationAddress, amount) => {
  try {
    console.log('🚀 Starting payment process...');
    console.log('Destination:', destinationAddress);
    console.log('Amount:', amount);
    console.log('Network Passphrase:', TESTNET_PASSPHRASE);

    // Get current account info
    const { address: sourceAddress } = await getAddress();
    console.log('Source Address:', sourceAddress);

    const sourceAccount = await server.loadAccount(sourceAddress);

    // Build the transaction with EXPLICIT TESTNET CONFIGURATION
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: TESTNET_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination: destinationAddress,
          asset: Asset.native(),
          amount: amount.toString(),
        })
      )
      .setTimeout(30)
      .build();

    // ✅ VERIFY NETWORK BEFORE SIGNING
    console.log('Transaction Network Passphrase:', transaction.networkPassphrase);
    if (transaction.networkPassphrase !== TESTNET_PASSPHRASE) {
      throw new Error('❌ CRITICAL: Transaction is NOT on Testnet!');
    }
    console.log('✅ Network verified as TESTNET');

    const xdr = transaction.toXDR();
    console.log('XDR built successfully');

    // Sign the transaction via Freighter with EXPLICIT TESTNET
    console.log('Requesting Freighter signature...');
    const signedResult = await signTransaction(xdr, {
      networkPassphrase: TESTNET_PASSPHRASE,
    });

    const signedXdr = typeof signedResult === 'string' ? signedResult : signedResult?.signedTxXdr;
    if (!signedXdr) {
      throw new Error('Freighter did not return a signed transaction XDR.');
    }

    console.log('✅ Transaction signed by Freighter');

    // 🔥 CRITICAL: Convert signed XDR back to Transaction object
    console.log('Converting signed XDR to Transaction object...');
    const signedTransaction = new Transaction(signedXdr, TESTNET_PASSPHRASE);
    console.log('✅ Transaction object created from signed XDR');

    // Submit to the TESTNET network
    console.log('Submitting to Horizon testnet...');
    const response = await server.submitTransaction(signedTransaction);
    
    console.log('✅ Transaction successful!');
    console.log('Transaction Hash:', response.hash);
    console.log('View at: https://stellar.expert/explorer/testnet/tx/' + response.hash);

    return response.hash;
  } catch (error) {
    console.error('❌ Transaction error:', error);
    console.error('Error message:', error.message);
    throw new Error(error.message || 'Failed to send payment');
  }
};

export { checkConnection, retrievePublicKey, getBalance, sendPayment };