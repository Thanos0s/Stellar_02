import React, { useState, useCallback } from 'react';
import { CONFIG } from '../config';

/**
 * Error type → display config map (3 distinct error types)
 */
const ERROR_DISPLAY = {
  WALLET_CONNECTION: {
    icon: '🔴',
    label: 'Wallet Error',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    titleColor: 'text-red-800',
    textColor: 'text-red-700',
    iconBg: 'bg-red-100',
  },
  CONTRACT_EXECUTION: {
    icon: '🟠',
    label: 'Transaction Error',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    titleColor: 'text-orange-800',
    textColor: 'text-orange-700',
    iconBg: 'bg-orange-100',
  },
  NETWORK: {
    icon: '🟡',
    label: 'Network Error',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    titleColor: 'text-yellow-800',
    textColor: 'text-yellow-700',
    iconBg: 'bg-yellow-100',
  },
  UNKNOWN: {
    icon: '⚠️',
    label: 'Error',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    titleColor: 'text-gray-800',
    textColor: 'text-gray-700',
    iconBg: 'bg-gray-100',
  },
};

/**
 * DonateForm — handles donation with 3 distinct error type UI
 */
export const DonateForm = ({ connected, donationState, onDonate, onReset }) => {
  const [amount, setAmount] = useState('');
  const [fieldError, setFieldError] = useState('');

  const validate = useCallback((val) => {
    const num = parseFloat(val);
    if (!val || isNaN(num)) return 'Please enter a donation amount.';
    if (num <= 0) return 'Amount must be greater than 0.';
    if (num < CONFIG.MIN_DONATION_XLM)
      return `Minimum donation is ${CONFIG.MIN_DONATION_XLM} XLM.`;
    if (num > 100000) return 'Maximum donation is 100,000 XLM.';
    return '';
  }, []);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    if (fieldError) setFieldError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate(amount);
    if (err) {
      setFieldError(err);
      return;
    }
    try {
      await onDonate(parseFloat(amount));
      setAmount('');
    } catch (_) {
      // error handled by parent via donationState
    }
  };

  const handleReset = () => {
    setAmount('');
    setFieldError('');
    onReset();
  };

  const isSubmitting =
    donationState.status === 'submitting' || donationState.status === 'pending';
  const isConfirmed = donationState.status === 'confirmed';
  const hasFailed = donationState.status === 'failed';
  const error = donationState.error;

  // ── Error Banner ──────────────────────────────────────────────────────────
  const renderError = () => {
    if (!error) return null;
    const display =
      ERROR_DISPLAY[error.type] || ERROR_DISPLAY.UNKNOWN;

    return (
      <div
        className={`${display.bgColor} ${display.borderColor} border rounded-xl p-4`}
        role="alert"
      >
        <div className="flex items-start space-x-3">
          <div
            className={`${display.iconBg} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <span>{display.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${display.titleColor}`}>
              {display.label}
            </p>
            <p className={`text-sm mt-0.5 ${display.textColor}`}>
              {error.message}
            </p>

            {/* Wallet Connection Error — show install links */}
            {error.type === 'WALLET_CONNECTION' && (
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href="https://www.freighter.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-red-700 underline hover:text-red-900"
                >
                  Install Freighter →
                </a>
                <a
                  href="https://albedo.link/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-red-700 underline hover:text-red-900"
                >
                  Use Albedo →
                </a>
              </div>
            )}

            {/* Network Error — retry button */}
            {error.type === 'NETWORK' && (
              <button
                onClick={handleReset}
                className="mt-2 text-xs font-medium text-yellow-800 underline hover:text-yellow-900"
              >
                🔄 Retry
              </button>
            )}

            {/* Contract Error — show tx hash if available */}
            {error.type === 'CONTRACT_EXECUTION' && donationState.txHash && (
              <a
                href={`${CONFIG.STELLAR_EXPERT_URL}/tx/${donationState.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-xs text-orange-700 underline hover:text-orange-900 font-mono truncate"
              >
                View tx: {donationState.txHash.substring(0, 20)}...
              </a>
            )}
          </div>

          <button
            onClick={handleReset}
            className={`${display.textColor} hover:opacity-70 flex-shrink-0`}
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  // ── Success State ─────────────────────────────────────────────────────────
  if (isConfirmed) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Donation Confirmed!</h3>
          <p className="text-gray-600 mb-1">
            Thank you for donating{' '}
            <strong>{donationState.amountXLM} XLM</strong> to the campaign!
          </p>
          {donationState.txHash && (
            <a
              href={`${CONFIG.STELLAR_EXPERT_URL}/tx/${donationState.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 underline font-mono"
            >
              View on Stellar Expert ↗
            </a>
          )}
          <button
            onClick={handleReset}
            className="mt-5 w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Donate Again
          </button>
        </div>
      </div>
    );
  }

  // ── Donate Form ───────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Make a Donation</h2>
        <p className="text-sm text-gray-500 mt-1">
          Donate XLM via your Stellar wallet. Minimum:{' '}
          <strong>{CONFIG.MIN_DONATION_XLM} XLM</strong>
        </p>
      </div>

      {/* Error banner */}
      {hasFailed && renderError()}

      {/* Not connected warning */}
      {!connected && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center space-x-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Wallet Not Connected</p>
            <p className="text-sm text-amber-700">
              Connect a wallet using the panel on the left to donate.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Donation Amount (XLM)
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder={`Min ${CONFIG.MIN_DONATION_XLM} XLM`}
              min={CONFIG.MIN_DONATION_XLM}
              step="0.1"
              disabled={isSubmitting || !connected}
              className={`w-full px-4 py-3 pr-16 border rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                fieldError
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 bg-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">
              XLM
            </span>
          </div>
          {fieldError && (
            <p className="text-red-600 text-xs mt-1.5 font-medium">{fieldError}</p>
          )}
        </div>

        {/* Quick amount buttons */}
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">Quick amounts:</p>
          <div className="flex flex-wrap gap-2">
            {[1, 5, 10, 25, 50].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setAmount(String(preset));
                  setFieldError('');
                }}
                disabled={isSubmitting || !connected}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  amount === String(preset)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {preset} XLM
              </button>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || !connected || !amount}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-4 rounded-xl font-bold text-base hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>
                {donationState.status === 'submitting'
                  ? 'Submitting…'
                  : 'Awaiting confirmation…'}
              </span>
            </div>
          ) : (
            `💙 Donate ${amount ? `${amount} XLM` : 'Now'}`
          )}
        </button>

        {/* Transaction status inline */}
        {donationState.status === 'pending' && donationState.txHash && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center space-x-3">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-blue-800">
                Waiting for confirmation…
              </p>
              <a
                href={`${CONFIG.STELLAR_EXPERT_URL}/tx/${donationState.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline font-mono truncate block"
              >
                {donationState.txHash.substring(0, 24)}…
              </a>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
