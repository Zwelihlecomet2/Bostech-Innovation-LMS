import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, HelpCircle, CheckCircle, BarChart3 } from 'lucide-react';
import TakeTest from './TakeTest';
import TestResults from './TestResults';

type ViewType = 'tests' | 'taking-test' | 'results';

const statColors = {
  primary: "bg-amber-600",
  secondary: "bg-orange-600",
  tertiary: "bg-amber-500",
  quaternary: "bg-orange-500"
};

export default function UserDashboard() {
  const { state } = useApp();
  const [currentView, setCurrentView] = useState<ViewType>('tests');
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  const activeTests = state.tests.filter(test => test.isActive);
  const userAttempts = state.testAttempts.filter(attempt => 
    attempt.userId === state.currentUser?.id
  );

  const getTestAttempts = (testId: string) => {
    return userAttempts.filter(attempt => attempt.testId === testId);
  };

  const startTest = (testId: string) => {
    setSelectedTestId(testId);
    setCurrentView('taking-test');
  };

  const onTestComplete = () => {
    setCurrentView('results');
  };

  const backToDashboard = () => {
    setCurrentView('tests');
    setSelectedTestId(null);
  };

  if (currentView === 'taking-test' && selectedTestId) {
    const test = state.tests.find(t => t.id === selectedTestId);
    if (!test) return null;
    
    return (
      <TakeTest
        test={test}
        onComplete={onTestComplete}
        onBack={backToDashboard}
      />
    );
  }

  if (currentView === 'results') {
    return (
      <TestResults
        onBack={backToDashboard}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {state.currentUser?.username}!
          </h1>
          <p className="text-gray-600 mt-1">Take tests and track your progress</p>
        </div>
        <button
          onClick={() => setCurrentView('results')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          <span>View Results</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Tests</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeTests.length}</p>
            </div>
            <div className={`p-3 rounded-lg ${statColors.primary}`}>
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tests Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{userAttempts.length}</p>
            </div>
            <div className={`p-3 rounded-lg ${statColors.secondary}`}>
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {userAttempts.length > 0 
                  ? Math.round(userAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / userAttempts.length) 
                  : 0}%
              </p>
            </div>
            <div className={`p-3 rounded-lg ${statColors.tertiary}`}>
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Available Tests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Available Tests</h2>
          <p className="text-gray-600 text-sm mt-1">Click on a test to start taking it</p>
        </div>

        {activeTests.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <HelpCircle className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tests available</h3>
            <p className="text-gray-500">There are currently no active tests. Check back later!</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTests.map((test) => {
              const attempts = getTestAttempts(test.id);
              const lastAttempt = attempts[attempts.length - 1];
              
              return (
                <div key={test.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{test.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{test.description}</p>
                    </div>
                    <span className="ml-2 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                      {test.category}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{test.duration} minutes</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      <span>{test.questions.length} questions</span>
                    </div>
                  </div>

                  {lastAttempt && (
                    <div className="p-3 bg-gray-50 rounded-lg mb-4">
                      <div className="text-xs text-gray-600 mb-1">Last attempt:</div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          lastAttempt.percentage >= 80 ? 'text-green-600' :
                          lastAttempt.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {lastAttempt.percentage.toFixed(1)}% ({lastAttempt.correctAnswers}/{lastAttempt.totalQuestions})
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(lastAttempt.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {attempts.length} / 2 attempts used
                    </span>
                    {attempts.length >= 2 ? (
                      <span className="text-sm text-red-600 font-medium">
                        Maximum attempts reached
                      </span>
                    ) : (
                      <button
                        onClick={() => startTest(test.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {attempts.length > 0 ? 'Final Attempt' : 'Start Test'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}