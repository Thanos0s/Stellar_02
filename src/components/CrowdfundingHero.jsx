import React from 'react';
import { CONFIG } from '../config';

/**
 * Campaign hero section — title, description, goal, deadline
 */
export const CrowdfundingHero = ({ campaign, loadingCampaign }) => {
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const deadlineLedger = campaign?.deadline || CONFIG.CAMPAIGN_DEADLINE_LEDGER;

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-xl">
      {/* Badge */}
      <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 mb-5">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        <span className="text-sm font-medium">Live Campaign · Stellar Testnet</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
        {CONFIG.CAMPAIGN_TITLE}
      </h1>

      {/* Description */}
      <p className="text-blue-100 text-lg mb-6 max-w-2xl leading-relaxed">
        {CONFIG.CAMPAIGN_DESCRIPTION}
      </p>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white/15 backdrop-blur rounded-xl p-4">
          <p className="text-blue-200 text-xs font-medium uppercase tracking-wide mb-1">
            Goal
          </p>
          <p className="text-2xl font-bold">
            {loadingCampaign ? (
              <span className="inline-block w-16 h-7 bg-white/20 animate-pulse rounded"></span>
            ) : (
              `${(campaign?.goal || CONFIG.CAMPAIGN_GOAL_XLM).toLocaleString()} XLM`
            )}
          </p>
        </div>

        <div className="bg-white/15 backdrop-blur rounded-xl p-4">
          <p className="text-blue-200 text-xs font-medium uppercase tracking-wide mb-1">
            Raised
          </p>
          <p className="text-2xl font-bold text-green-300">
            {loadingCampaign ? (
              <span className="inline-block w-20 h-7 bg-white/20 animate-pulse rounded"></span>
            ) : (
              `${(campaign?.raised || 0).toFixed(2)} XLM`
            )}
          </p>
        </div>

        <div className="bg-white/15 backdrop-blur rounded-xl p-4 col-span-2 md:col-span-1">
          <p className="text-blue-200 text-xs font-medium uppercase tracking-wide mb-1">
            Deadline (Ledger)
          </p>
          <p className="text-lg font-bold">
            #{deadlineLedger.toLocaleString()}
          </p>
          <p className="text-blue-200 text-xs mt-0.5">
            Status:{' '}
            <span className={campaign?.active !== false ? 'text-green-300' : 'text-red-300'}>
              {campaign?.active !== false ? 'Active' : 'Closed'}
            </span>
          </p>
        </div>
      </div>

      {/* Contract address */}
      <div className="mt-5 pt-5 border-t border-white/20">
        <p className="text-blue-200 text-xs">
          Contract:{' '}
          <a
            href={`${CONFIG.STELLAR_EXPERT_URL}/contract/${CONFIG.CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-mono hover:underline"
          >
            {CONFIG.CONTRACT_ADDRESS.substring(0, 12)}...{CONFIG.CONTRACT_ADDRESS.slice(-6)}
          </a>
        </p>
      </div>
    </div>
  );
};
