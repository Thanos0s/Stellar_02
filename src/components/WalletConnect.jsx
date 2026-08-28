import React from 'react';
import { useWallet } from '../hooks/useWallet';

/**
 * Multi-wallet connect panel — Freighter, Albedo, xBull
 */
export const WalletConnect = ({ onConnected }) => {
  const {
    connected,
    address,
    balance,
    loading,
    error,
    provider,
    connect,
    disconnect,
    isProviderInstalled,
    walletProviders,
    clearError,
  } = useWallet();

  React.useEffect(() => {
    if (onConnected) onConnected(connected);
  }, [connected, onConnected]);

  const handleConnect = async (walletProvider) => {
    clearError();
    try {
      await connect(walletProvider);
    } catch (err) {
      // Error is stored in hook state
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // ── Connected State ──────────────────────────────────────────────────────
  if (connected) {
    const info = walletProviders[provider] || {};
    return (
      <div className="space-y-4">
        {/* Connected badge */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-green-800">Connected</span>
            </div>
            <button
              onClick={disconnect}
              className="text-xs text-green-600 hover:text-green-800 font-medium"
            >
              Disconnect
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Wallet</span>
              <span className="font-semibold flex items-center space-x-1">
                <span>{info.icon}</span>
                <span>{info.name || provider}</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Address</span>
              <code className="text-xs font-mono text-gray-700">
                {formatAddress(address)}
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Balance</span>
              <span className="font-bold text-green-700">
                {parseFloat(balance).toFixed(4)} XLM
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Disconnected State ───────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-bold text-gray-900 mb-0.5">Connect Wallet</h3>
        <p className="text-xs text-gray-500">Choose your Stellar wallet</p>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className={`rounded-xl p-3 border text-sm ${
            error.type === 'WALLET_CONNECTION'
              ? 'bg-red-50 border-red-200 text-red-700'
              : error.type === 'NETWORK'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
              : 'bg-gray-50 border-gray-200 text-gray-700'
          }`}
        >
          <div className="flex justify-between items-start">
            <p className="font-medium text-xs">
              {error.type === 'WALLET_CONNECTION'
                ? '🔴 Wallet Error'
                : error.type === 'NETWORK'
                ? '🟡 Network Error'
                : '⚠️ Error'}
            </p>
            <button onClick={clearError} className="text-gray-400 hover:text-gray-700 ml-2">
              ✕
            </button>
          </div>
          <p className="mt-1 text-xs">{error.message}</p>
        </div>
      )}

      {/* Wallet options */}
      <div className="space-y-2">
        {Object.entries(walletProviders).map(([key, info]) => {
          const installed = isProviderInstalled(key);
          return (
            <button
              key={key}
              onClick={() => handleConnect(key)}
              disabled={loading}
              className={`w-full flex items-center justify-between p-3 border rounded-xl transition-all ${
                installed
                  ? 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                  : 'border-gray-100 bg-gray-50 cursor-pointer opacity-80'
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Icon */}
                <div
                  className={`w-9 h-9 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center shadow-sm`}
                >
                  <span className="text-lg">{info.icon}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{info.name}</p>
                  <p className="text-xs text-gray-400">{info.description}</p>
                </div>
              </div>

              <div className="text-right flex-shrink-0 ml-2">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : installed ? (
                  <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                    Ready
                  </span>
                ) : (
                  <a
                    href={info.installUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-blue-600 underline hover:text-blue-800"
                  >
                    Install
                  </a>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center pt-1">
        🔒 Your keys stay in your wallet — never shared
      </p>
    </div>
  );
};
