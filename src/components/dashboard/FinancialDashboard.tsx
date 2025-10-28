'use client';

import React, { useState } from 'react';
import { SpendingCharts } from '@/components/charts/SpendingCharts';
import { PortfolioCharts } from '@/components/charts/PortfolioCharts';
import { TokenBalance, Portfolio, Transaction } from '@/types/shared';

interface FinancialDashboardProps {
  transactions: Transaction[];
  tokenBalances: TokenBalance[];
  portfolio: Portfolio | null;
  className?: string;
}

type DashboardView = 'overview' | 'spending' | 'portfolio';

export function FinancialDashboard({ 
  transactions, 
  tokenBalances, 
  portfolio, 
  className = '' 
}: FinancialDashboardProps) {
  const [activeView, setActiveView] = useState<DashboardView>('overview');

  const hasTransactions = transactions.length > 0;
  const hasTokens = tokenBalances.length > 0;
  const totalPortfolioValue = portfolio?.totalValue || 0;
  const totalSpending = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const renderTabButton = (view: DashboardView, label: string, disabled = false) => (
    <button
      onClick={() => setActiveView(view)}
      disabled={disabled}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        activeView === view
          ? 'bg-blue-600 text-white'
          : disabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalPortfolioValue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-sm ${portfolio?.totalChange24h && portfolio.totalChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolio?.totalChange24h ? (portfolio.totalChange24h >= 0 ? '+' : '') + portfolio.totalChange24h.toFixed(2) + '%' : 'N/A'} 24h
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spending</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalSpending.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">
              {transactions.filter(t => t.type === 'expense').length} transactions
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assets</p>
              <p className="text-2xl font-bold text-gray-900">
                {tokenBalances.length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">
              {tokenBalances.filter(t => t.value && t.value > 0).length} with value
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Worth</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(totalPortfolioValue - totalSpending).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">
              Portfolio - Spending
            </span>
          </div>
        </div>
      </div>

      {/* Quick Charts Preview */}
      {hasTransactions && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction, index) => {
              const transactionDate = transaction.date instanceof Date ? transaction.date : new Date(transaction.date);
              return (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transactionDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tab Navigation */}
      <div className="flex space-x-2 bg-gray-50 p-1 rounded-lg">
        {renderTabButton('overview', 'Overview')}
        {renderTabButton('spending', 'Spending Analysis', !hasTransactions)}
        {renderTabButton('portfolio', 'Portfolio Analysis', !hasTokens)}
      </div>

      {/* Content */}
      {activeView === 'overview' && renderOverview()}
      {activeView === 'spending' && hasTransactions && (
        <SpendingCharts transactions={transactions} />
      )}
      {activeView === 'portfolio' && hasTokens && (
        <PortfolioCharts tokenBalances={tokenBalances} portfolio={portfolio} />
      )}

      {/* Empty States */}
      {activeView === 'spending' && !hasTransactions && (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Transaction Data</h3>
          <p className="text-gray-500">Connect your bank account to view spending analysis</p>
        </div>
      )}

      {activeView === 'portfolio' && !hasTokens && (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Portfolio Data</h3>
          <p className="text-gray-500">Connect your wallet to view portfolio analysis</p>
        </div>
      )}
    </div>
  );
}