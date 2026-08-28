import { CONFIG } from '../config';
import {
  WalletConnectionError,
  WalletNotFoundError,
  WalletRejectionError,
} from '../utils/errorHandler';
import * as StellarSdk from '@stellar/stellar-sdk';

// Wallet provider metadata
export const WALLET_PROVIDERS = {
  freighter: {
    name: 'Freighter',
    icon: '🚀',
    color: 'from-blue-500 to-blue-700',
    installUrl: 'https://www.freighter.app/',
    description: 'Official Stellar wallet',
  },
  albedo: {
    name: 'Albedo',
    icon: '🔑',
    color: 'from-purple-500 to-purple-700',
    installUrl: 'https://albedo.link/',
    description: 'Web-based Stellar signer',
  },
  xbull: {
    name: 'xBull',
    icon: '⚡',
    color: 'from-yellow-500 to-orange-600',
    installUrl: 'https://xbull.app/',
    description: 'Feature-rich Stellar wallet',
  },
};

export class WalletService {
  constructor() {
    this.provider = null;
    this.publicKey = null;
    this.server = new StellarSdk.SorobanRpc.Server(CONFIG.SOROBAN_RPC_URL);
  }

  /**
   * Detect installed wallet providers
   */
  detectProviders() {
    const providers = [];
    if (this.isProviderInstalled('freighter')) providers.push('freighter');
    if (this.isProviderInstalled('albedo')) providers.push('albedo');
    if (this.isProviderInstalled('xbull')) providers.push('xbull');
    return providers;
  }

  /**
   * Check if a specific provider is installed
   */
  isProviderInstalled(provider) {
    switch (provider) {
      case 'freighter':
        return !!(window.freighterApi || window.freighter);
      case 'albedo':
        return !!window.albedo;
      case 'xbull':
        return !!(window.xBullSDK || window.xbull);
      default:
        return false;
    }
  }

  /**
   * Connect to Freighter wallet
   */
  async connectFreighter() {
    try {
      const freighterApi = window.freighterApi || window.freighter;
      if (!freighterApi) {
        throw new WalletNotFoundError('Freighter');
      }

      // Check if Freighter has access
      let publicKey;
      try {
        const isAllowed = await freighterApi.isAllowed?.();
        if (!isAllowed) {
          await freighterApi.setAllowed?.();
        }
        publicKey = await freighterApi.getPublicKey();
      } catch (e) {
        publicKey = await freighterApi.getPublicKey();
      }

      if (!publicKey) {
        throw new WalletRejectionError();
      }

      this.provider = 'freighter';
      this.publicKey = publicKey;
      sessionStorage.setItem('wallet_provider', 'freighter');
      sessionStorage.setItem('wallet_address', publicKey);

      return { publicKey };
    } catch (error) {
      if (error instanceof WalletConnectionError) throw error;
      if (error?.message?.includes('rejected') || error?.message?.includes('denied')) {
        throw new WalletRejectionError();
      }
      throw new WalletConnectionError('Freighter connection failed: ' + error?.message);
    }
  }

  /**
   * Connect to Albedo wallet
   */
  async connectAlbedo() {
    try {
      if (!window.albedo) {
        throw new WalletNotFoundError('Albedo');
      }

      const result = await window.albedo.publicKey({
        require_existing: false,
      });

      this.provider = 'albedo';
      this.publicKey = result.pubkey;
      sessionStorage.setItem('wallet_provider', 'albedo');
      sessionStorage.setItem('wallet_address', result.pubkey);

      return { publicKey: result.pubkey };
    } catch (error) {
      if (error instanceof WalletConnectionError) throw error;
      if (error?.message?.includes('rejected') || error?.code === -1) {
        throw new WalletRejectionError();
      }
      throw new WalletConnectionError('Albedo connection failed: ' + error?.message);
    }
  }

  /**
   * Connect to xBull wallet
   */
  async connectXBull() {
    try {
      const xbullSDK = window.xBullSDK || window.xbull;
      if (!xbullSDK) {
        throw new WalletNotFoundError('xBull');
      }

      const result = await xbullSDK.connect();
      const publicKey = result?.publicKey || result;

      if (!publicKey) {
        throw new WalletRejectionError();
      }

      this.provider = 'xbull';
      this.publicKey = publicKey;
      sessionStorage.setItem('wallet_provider', 'xbull');
      sessionStorage.setItem('wallet_address', publicKey);

      return { publicKey };
    } catch (error) {
      if (error instanceof WalletConnectionError) throw error;
      if (error?.message?.includes('rejected')) {
        throw new WalletRejectionError();
      }
      throw new WalletConnectionError('xBull connection failed: ' + error?.message);
    }
  }

  /**
   * Connect wallet by provider name
   */
  async connect(provider) {
    switch (provider) {
      case 'freighter':
        return this.connectFreighter();
      case 'albedo':
        return this.connectAlbedo();
      case 'xbull':
        return this.connectXBull();
      default:
        throw new WalletConnectionError(`Unknown wallet provider: ${provider}`);
    }
  }

  /**
   * Sign a transaction with the connected wallet
   */
  async signTransaction(tx) {
    const xdr = tx.toXDR();

    if (this.provider === 'freighter') {
      const freighterApi = window.freighterApi || window.freighter;
      let signedXdr;
      // Handle both old and new Freighter API
      if (typeof freighterApi.signTransaction === 'function') {
        const result = await freighterApi.signTransaction(xdr, {
          networkPassphrase: CONFIG.NETWORK_PASSPHRASE,
          network: 'TESTNET',
        });
        signedXdr = typeof result === 'string' ? result : result?.signedTxXdr || result;
      } else {
        throw new WalletConnectionError('Freighter signTransaction not available');
      }
      return StellarSdk.TransactionBuilder.fromXDR(signedXdr, CONFIG.NETWORK_PASSPHRASE);

    } else if (this.provider === 'albedo') {
      const result = await window.albedo.tx({
        xdr,
        network: 'testnet',
        submit: false,
      });
      return StellarSdk.TransactionBuilder.fromXDR(
        result.signed_envelope_xdr,
        CONFIG.NETWORK_PASSPHRASE
      );

    } else if (this.provider === 'xbull') {
      const xbullSDK = window.xBullSDK || window.xbull;
      const result = await xbullSDK.signXDR(xdr, {
        network: 'TESTNET',
      });
      const signedXdr = typeof result === 'string' ? result : result?.signedXDR || result;
      return StellarSdk.TransactionBuilder.fromXDR(signedXdr, CONFIG.NETWORK_PASSPHRASE);

    } else {
      throw new WalletConnectionError('No wallet connected');
    }
  }

  /**
   * Get wallet balance in XLM
   */
  async getBalance(publicKey) {
    try {
      const account = await this.server.getAccount(publicKey);
      const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
      return nativeBalance ? nativeBalance.balance : '0';
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  }

  /**
   * Try to reconnect to previous wallet
   */
  async tryReconnect() {
    const savedProvider = sessionStorage.getItem('wallet_provider');
    const savedAddress = sessionStorage.getItem('wallet_address');

    if (!savedProvider || !savedAddress) return null;

    try {
      if (!this.isProviderInstalled(savedProvider)) return null;
      await this.connect(savedProvider);
      return { provider: savedProvider, publicKey: this.publicKey };
    } catch (error) {
      console.warn('Failed to reconnect to wallet:', error);
      this.disconnect();
      return null;
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect() {
    this.provider = null;
    this.publicKey = null;
    sessionStorage.removeItem('wallet_provider');
    sessionStorage.removeItem('wallet_address');
  }

  isConnected() {
    return !!this.publicKey;
  }

  getWalletInfo() {
    return {
      connected: this.isConnected(),
      provider: this.provider,
      publicKey: this.publicKey,
    };
  }
}

export const walletService = new WalletService();
