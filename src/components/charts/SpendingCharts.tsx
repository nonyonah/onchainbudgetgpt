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
  Area,
  AreaChart
} from 'recharts';

interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string | Date;
  description: string;
  type: 'income' | 'expense';
}

interface SpendingChartsProps {
  transactions: Transaction[];
  className?: string;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

interface TrendData {
  date: string;
  amount: number;
  income: number;
  expenses: number;
}

const CATEGORY_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
  '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98'
];

export function SpendingCharts({ transactions, className = '' }: SpendingChartsProps) {
  // Process data for category breakdown
  const getCategoryData = (): CategoryData[] => {
    const categoryTotals: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const category = transaction.category || 'Other';
        categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(transaction.amount);
      });

    return Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Process data for spending trends
  const getTrendData = (): TrendData[] => {
    const dailyData: Record<string, { income: number; expenses: number }> = {};
    
    transactions.forEach(transaction => {
      const transactionDate = transaction.date instanceof Date ? transaction.date : new Date(transaction.date);
      const date = transactionDate.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        dailyData[date].income += transaction.amount;
      } else {
        dailyData[date].expenses += Math.abs(transaction.amount);
      }
    });

    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: data.income - data.expenses,
        income: data.income,
        expenses: data.expenses
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days
  };

  // Get monthly spending data
  const getMonthlyData = () => {
    const monthlyData: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const transactionDate = transaction.date instanceof Date ? transaction.date : new Date(transaction.date);
        const month = transactionDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        monthlyData[month] = (monthlyData[month] || 0) + Math.abs(transaction.amount);
      });

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .slice(-12); // Last 12 months
  };

  const categoryData = getCategoryData();
  const trendData = getTrendData();
  const monthlyData = getMonthlyData();

  const totalSpending = categoryData.reduce((sum, item) => sum + item.value, 0);

  if (transactions.length === 0) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow-sm ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Analysis</h3>
        <div className="text-center py-8 text-gray-500">
          No transaction data available for analysis
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Category Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Category Breakdown</h4>
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${item.value.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">
                    {((item.value / totalSpending) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Trends */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Cash Flow (Last 30 Days)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, '']} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="income" 
                stackId="1" 
                stroke="#82ca9d" 
                fill="#82ca9d" 
                name="Income"
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stackId="2" 
                stroke="#ff7c7c" 
                fill="#ff7c7c" 
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Spending Trends */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spending']} />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              ${totalSpending.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Spending</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {categoryData.length}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              ${(totalSpending / Math.max(categoryData.length, 1)).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Avg per Category</div>
          </div>
        </div>
      </div>
    </div>
  );
}