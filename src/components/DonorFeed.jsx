import React from 'react';
import { CONFIG } from '../config';

const formatAddress = (addr) => {
  if (!addr) return 'Anonymous';
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString();
};

/**
 * Single donation feed item
 */
const DonationItem = ({ donation, isNew }) => (
  <div
    className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-500 ${
      isNew ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-transparent'
    }`}
  >
    {/* Avatar */}
    <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
      <span className="text-white text-sm font-bold">
        {donation.donor
          ? donation.donor.charAt(0).toUpperCase()
          : '?'}
      </span>
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center space-x-2">
        <code className="text-xs text-gray-700 font-mono">
          {formatAddress(donation.donor)}
        </code>
        {donation.isLocal && (
          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
            You
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-0.5">{formatTime(donation.timestamp)}</p>
    </div>

    {/* Amount */}
    <div className="text-right flex-shrink-0">
      <p className="text-sm font-bold text-green-700">
        +{donation.amount?.toFixed(2) || '0'} XLM
      </p>
      {donation.txHash && (
        <a
          href={`${CONFIG.STELLAR_EXPERT_URL}/tx/${donation.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
        >
          tx ↗
        </a>
      )}
    </div>
  </div>
);

/**
 * Real-time donation feed component
 */
export const DonorFeed = ({ donations }) => {
  const [newestId, setNewestId] = React.useState(null);

  React.useEffect(() => {
    if (donations.length > 0) {
      const newest = donations[0];
      setNewestId(newest.id);
      // Remove "new" highlight after 3 seconds
      const timer = setTimeout(() => setNewestId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [donations]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Recent Donations</h3>
          <p className="text-xs text-gray-500 mt-0.5">Live from Stellar Testnet</p>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-xs text-gray-500 font-medium">Live</span>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-2">
        {donations.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">💙</span>
            </div>
            <p className="text-gray-500 text-sm">No donations yet.</p>
            <p className="text-gray-400 text-xs mt-1">Be the first to contribute!</p>
          </div>
        ) : (
          donations.slice(0, 10).map((donation) => (
            <DonationItem
              key={donation.id}
              donation={donation}
              isNew={donation.id === newestId}
            />
          ))
        )}
      </div>

      {donations.length > 10 && (
        <p className="text-center text-xs text-gray-400 mt-3">
          + {donations.length - 10} more donations
        </p>
      )}
    </div>
  );
};
