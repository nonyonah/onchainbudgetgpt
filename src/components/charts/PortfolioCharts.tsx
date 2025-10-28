'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap
} from 'recharts';

interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  value: number;
  isNative: boolean;
}

interface Portfolio {
  totalValue: number;
  totalChange24h: number;
  tokens: TokenBalance[];
}

interface PortfolioChartsProps {
  tokenBalances: TokenBalance[];
  portfolio: Portfolio | null;
  className?: string;
}

const TOKEN_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
  '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98',
  '#f0e68c', '#ff6347', '#40e0d0', '#ee82ee', '#90ee90'
];

export function PortfolioCharts({ tokenBalances, portfolio, className = '' }: PortfolioChartsProps) {
  // Process data for token allocation
  const getTokenAllocation = () => {
    return tokenBalances
      .filter(token => token.value > 0)
      .map((token, index) => ({
        name: token.symbol,
        fullName: token.name,
        value: token.value,
        balance: token.balance,
        color: TOKEN_COLORS[index % TOKEN_COLORS.length],
        isNative: token.isNative
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Process data for treemap visualization
  const getTreeMapData = () => {
    const allocation = getTokenAllocation();
    return allocation.map(token => ({
      name: token.name,
      size: token.value,
      fill: token.color
    }));
  };

  // Generate mock historical data for demonstration
  const getHistoricalData = () => {
    const days = 30;
    const data = [];
    const baseValue = portfolio?.totalValue || 1000;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic price movement
      const randomChange = (Math.random() - 0.5) * 0.1; // ±5% daily change
      const value = baseValue * (1 + randomChange * (i / days));
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.max(value, 0),
        change: randomChange * 100
      });
    }
    
    return data;
  };

  const tokenAllocation = getTokenAllocation();
  const treeMapData = getTreeMapData();
  const historicalData = getHistoricalData();
  const totalValue = portfolio?.totalValue || 0;
  const totalChange24h = portfolio?.totalChange24h || 0;

  if (tokenBalances.length === 0) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow-sm ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Analysis</h3>
        <div className="text-center py-8 text-gray-500">
          No token holdings available for analysis
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Portfolio Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              ${totalValue.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${totalChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChange24h >= 0 ? '+' : ''}{totalChange24h.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-600">24h Change</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {tokenAllocation.length}
            </div>
            <div className="text-sm text-gray-600">Assets</div>
          </div>
        </div>
      </div>

      {/* Token Allocation */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Allocation</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tokenAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tokenAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
                  labelFormatter={(label) => `${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Holdings Breakdown</h4>
            {tokenAllocation.map((token, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: token.color }}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">{token.name}</span>
                    {token.isNative && (
                      <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                        Native
                      </span>
                    )}
                    <div className="text-xs text-gray-500">{token.balance} {token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${token.value.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">
                    {((token.value / totalValue) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Performance */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance (30 Days)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Portfolio Value']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset Distribution Treemap */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Distribution</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treeMapData}
              dataKey="size"
              stroke="#fff"
              fill="#8884d8"
            />
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Holdings */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Holdings</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tokenAllocation.slice(0, 10)} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']} />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}