import React from 'react';

/**
 * Animated progress bar for crowdfunding campaign
 */
export const ProgressBar = ({ raised, goal, progress }) => {
  const pct = Math.min(100, Math.max(0, progress || 0));
  const isComplete = pct >= 100;

  const getBarColor = () => {
    if (isComplete) return 'from-green-400 to-emerald-500';
    if (pct >= 75) return 'from-blue-400 to-green-400';
    if (pct >= 50) return 'from-blue-500 to-blue-400';
    if (pct >= 25) return 'from-indigo-500 to-blue-500';
    return 'from-violet-500 to-indigo-500';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Campaign Progress</h3>
          <p className="text-sm text-gray-500 mt-0.5">Real-time from Stellar Testnet</p>
        </div>
        <div className="text-right">
          <span
            className={`text-3xl font-extrabold ${
              isComplete ? 'text-green-600' : 'text-blue-600'
            }`}
          >
            {pct.toFixed(1)}%
          </span>
          {isComplete && (
            <p className="text-green-600 text-sm font-semibold">🎉 Goal Reached!</p>
          )}
        </div>
      </div>

      {/* Progress bar track */}
      <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getBarColor()} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${pct}%` }}
        >
          {/* Shimmer animation */}
          <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
        </div>

        {/* Milestone markers */}
        {[25, 50, 75].map((milestone) => (
          <div
            key={milestone}
            className="absolute top-0 bottom-0 w-px bg-gray-300/60"
            style={{ left: `${milestone}%` }}
          />
        ))}
      </div>

      {/* Milestone labels */}
      <div className="flex justify-between mt-1.5 text-xs text-gray-400 px-0.5">
        <span>0</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>

      {/* Raised / Goal */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-0.5">
            Raised
          </p>
          <p className="text-xl font-bold text-gray-900">
            {(raised || 0).toFixed(4)}{' '}
            <span className="text-sm font-medium text-gray-500">XLM</span>
          </p>
        </div>

        <div className="h-10 w-px bg-gray-200" />

        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-0.5">
            Goal
          </p>
          <p className="text-xl font-bold text-gray-900">
            {(goal || 0).toLocaleString()}{' '}
            <span className="text-sm font-medium text-gray-500">XLM</span>
          </p>
        </div>

        <div className="h-10 w-px bg-gray-200" />

        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-0.5">
            Remaining
          </p>
          <p className="text-xl font-bold text-gray-900">
            {Math.max(0, (goal || 0) - (raised || 0)).toFixed(2)}{' '}
            <span className="text-sm font-medium text-gray-500">XLM</span>
          </p>
        </div>
      </div>
    </div>
  );
};
