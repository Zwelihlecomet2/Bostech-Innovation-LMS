import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, FileText, BarChart3, Plus } from 'lucide-react';
import UserManagement from './UserManagement';
import TestManagement from './TestManagement';
import ResultsAnalytics from './ResultsAnalytics';

type TabType = 'users' | 'tests' | 'results';

const statColors = {
  primary: "bg-amber-600",
  secondary: "bg-orange-600",
  tertiary: "bg-amber-500",
  quaternary: "bg-orange-500"
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const { state } = useApp();

  const stats = [
    {
      title: 'Total Users',
      value: state.users.filter(u => u.role === 'user').length,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Tests',
      value: state.tests.filter(t => t.isActive).length,
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      title: 'Test Attempts',
      value: state.testAttempts.length,
      icon: BarChart3,
      color: 'bg-purple-500'
    }
  ];

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'tests', label: 'Test Management', icon: FileText },
    { id: 'results', label: 'Results & Analytics', icon: BarChart3 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage users, tests, and view analytics</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${statColors.primary}`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'tests' && <TestManagement />}
          {activeTab === 'results' && <ResultsAnalytics />}
        </div>
      </div>
    </div>
  );
}