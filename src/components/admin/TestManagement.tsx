import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Test } from '../../types';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, Clock, HelpCircle, Info } from 'lucide-react';
import TestForm from './TestForm';

export default function TestManagement() {
  const { state, dispatch } = useApp();
  const [showTestForm, setShowTestForm] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTests = state.tests.filter(test =>
    test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteTest = (testId: string) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      dispatch({ type: 'DELETE_TEST', payload: testId });
    }
  };

  const toggleTestStatus = (test: Test) => {
    dispatch({
      type: 'UPDATE_TEST',
      payload: { ...test, isActive: !test.isActive }
    });
  };

  const handleEditTest = (test: Test) => {
    setEditingTest(test);
    setShowTestForm(true);
  };

  const closeForm = () => {
    setShowTestForm(false);
    setEditingTest(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Test Management</h2>
          <p className="text-gray-600 text-sm">Create and manage tests with questions</p>
        </div>
        <button
          onClick={() => setShowTestForm(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Test</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search tests by title or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Tests Grid */}
      {filteredTests.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-2">
            <Plus className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No tests found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'No tests match your search criteria.' : 'Get started by creating your first test.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowTestForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Create First Test
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <div key={test.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Test Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{test.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{test.description}</p>
                </div>
                <span
                  className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                    test.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {test.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Test Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {test.category}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{test.duration} minutes</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  <span>{test.questions.length} questions</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Info className="w-4 h-4 mr-2" />
                  <span>Maximum 2 attempts per user</span>
                </div>
              </div>

              {/* Test Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Created {new Date(test.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => toggleTestStatus(test)}
                    className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                      test.isActive ? 'text-red-600' : 'text-green-600'
                    }`}
                    title={test.isActive ? 'Deactivate test' : 'Activate test'}
                  >
                    {test.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEditTest(test)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-blue-600 transition-colors"
                    title="Edit test"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTest(test.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-red-600 transition-colors"
                    title="Delete test"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Test Form Modal */}
      {showTestForm && (
        <TestForm
          test={editingTest}
          onClose={closeForm}
          onSave={closeForm}
        />
      )}
    </div>
  );
}