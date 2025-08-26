import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Test, Question } from '../../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface TestFormProps {
  test?: Test | null;
  onClose: () => void;
  onSave: () => void;
}

export default function TestForm({ test, onClose, onSave }: TestFormProps) {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration: 30,
    isActive: true
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (test) {
      setFormData({
        title: test.title,
        description: test.description,
        category: test.category,
        duration: test.duration,
        isActive: test.isActive
      });
      setQuestions(test.questions);
    } else {
      // Add one empty question by default
      addQuestion();
    }
  }, [test]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}-${questions.length}`,
      text: '',
      options: { A: '', B: '', C: '', D: '' },
      correctAnswer: 'A'
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const updateQuestionOption = (index: number, option: 'A' | 'B' | 'C' | 'D', value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].options[option] = value;
    setQuestions(updatedQuestions);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Test title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Test description is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (formData.duration < 5) {
      newErrors.duration = 'Duration must be at least 5 minutes';
    }

    if (questions.length === 0) {
      newErrors.questions = 'At least one question is required';
    } else {
      questions.forEach((question, index) => {
        if (!question.text.trim()) {
          newErrors[`question-${index}-text`] = 'Question text is required';
        }
        Object.entries(question.options).forEach(([key, value]) => {
          if (!value.trim()) {
            newErrors[`question-${index}-option-${key}`] = `Option ${key} is required`;
          }
        });
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const testData: Test = {
      id: test?.id || `test-${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      duration: formData.duration,
      questions,
      isActive: formData.isActive,
      createdAt: test?.createdAt || new Date().toISOString(),
      createdBy: state.currentUser?.id || ''
    };

    if (test) {
      dispatch({ type: 'UPDATE_TEST', payload: testData });
    } else {
      dispatch({ type: 'ADD_TEST', payload: testData });
    }

    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {test ? 'Edit Test' : 'Create New Test'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Test Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter test title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Math, Science, History"
                />
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
                placeholder="Enter test description"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.duration ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active test (available to users)
                </label>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>

              {questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors[`question-${index}-text`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter question text"
                    />
                    {errors[`question-${index}-text`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`question-${index}-text`]}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(question.options).map(([optionKey, optionValue]) => (
                      <div key={optionKey}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Option {optionKey}
                        </label>
                        <input
                          type="text"
                          value={optionValue}
                          onChange={(e) => updateQuestionOption(index, optionKey as 'A' | 'B' | 'C' | 'D', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`question-${index}-option-${optionKey}`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder={`Enter option ${optionKey}`}
                        />
                        {errors[`question-${index}-option-${optionKey}`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`question-${index}-option-${optionKey}`]}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer
                    </label>
                    <select
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value as 'A' | 'B' | 'C' | 'D')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.keys(question.options).map(option => (
                        <option key={option} value={option}>
                          Option {option}: {question.options[option as 'A' | 'B' | 'C' | 'D'] || `Option ${option}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                {test ? 'Update Test' : 'Create Test'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}