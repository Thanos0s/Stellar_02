import React, { useState } from 'react';
import './App.css';
import { CONFIG } from './config';
import { WalletConnect } from './components/WalletConnect';
import { CrowdfundingHero } from './components/CrowdfundingHero';
import { ProgressBar } from './components/ProgressBar';
import { DonateForm } from './components/DonateForm';
import { DonorFeed } from './components/DonorFeed';
import { TransactionStatus } from './components/TransactionStatus';
import { useCrowdfunding } from './hooks/useCrowdfunding';

function App() {
  const [walletConnected, setWalletConnected] = useState(false);

  const {
    campaign,
    donations,
    loadingCampaign,
    donationState,
    donate,
    resetDonation,
    refreshCampaign,
  } = useCrowdfunding();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow">
                <span className="text-white font-bold text-base">💧</span>
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-gray-900 leading-tight">
                  StellarFund
                </h1>
                <p className="text-xs text-gray-400">Crowdfunding on Stellar</p>
              </div>
            </div>

            {/* Network badge */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-700">Stellar Testnet</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Contract</p>
                <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-600">
                  {CONFIG.CONTRACT_ADDRESS.substring(0, 10)}…
                </code>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Hero */}
        <CrowdfundingHero campaign={campaign} loadingCampaign={loadingCampaign} />

        {/* Progress Bar */}
        <ProgressBar
          raised={campaign.raised}
          goal={campaign.goal}
          progress={campaign.progress}
        />

        {/* Body Grid — 3 cols */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar — Wallet */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <WalletConnect onConnected={setWalletConnected} />
            </div>

            {/* Network info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
              <h4 className="font-bold text-gray-900 text-sm">Campaign Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Network</span>
                  <span className="font-medium text-gray-900">Stellar Testnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={`font-medium ${
                      campaign.active !== false ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {campaign.active !== false ? '● Active' : '● Closed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Goal</span>
                  <span className="font-medium text-gray-900">
                    {(campaign.goal || CONFIG.CAMPAIGN_GOAL_XLM).toLocaleString()} XLM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Min. Donation</span>
                  <span className="font-medium text-gray-900">
                    {CONFIG.MIN_DONATION_XLM} XLM
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <a
                    href={`${CONFIG.STELLAR_EXPERT_URL}/contract/${CONFIG.CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    View Contract on Explorer ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Refresh button */}
            <button
              onClick={refreshCampaign}
              className="w-full text-sm text-gray-500 hover:text-blue-600 border border-gray-200 rounded-xl py-2 hover:border-blue-300 transition-colors bg-white"
            >
              🔄 Refresh Campaign Data
            </button>
          </div>

          {/* Center — Donate Form + Tx Status */}
          <div className="lg:col-span-1 space-y-4">
            <DonateForm
              connected={walletConnected}
              donationState={donationState}
              onDonate={donate}
              onReset={resetDonation}
            />

            {/* Transaction status (when tx is in flight or completed) */}
            {donationState.status !== 'idle' && donationState.txHash && (
              <TransactionStatus
                txHash={donationState.txHash}
                status={donationState.status}
              />
            )}
          </div>

          {/* Right — Donor Feed */}
          <div className="lg:col-span-1">
            <DonorFeed donations={donations} />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 pb-4 space-y-1">
          <p>
            Built on{' '}
            <a
              href="https://stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Stellar
            </a>{' '}
            · Powered by Soroban Smart Contracts
          </p>
          <p>
            Contract:{' '}
            <code className="font-mono">{CONFIG.CONTRACT_ADDRESS}</code>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
