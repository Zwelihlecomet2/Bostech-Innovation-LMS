import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Test, TestAttempt } from '../../types';
import { Clock, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

interface TakeTestProps {
  test: Test;
  onComplete: () => void;
  onBack: () => void;
}

export default function TakeTest({ test, onComplete, onBack }: TakeTestProps) {
  const { state, dispatch } = useApp();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [timeLeft, setTimeLeft] = useState(Math.max(0, (test.duration || 0) * 60)); // Convert minutes to seconds with validation
  const [startTime] = useState(Date.now());
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  const currentQuestion = test.questions[currentQuestionIndex];

  // Check for attempt limit
  const userAttempts = state.testAttempts.filter(
    attempt => attempt.testId === test.id && attempt.userId === state.currentUser?.id
  );

  if (userAttempts.length >= 2) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-red-600 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Maximum Attempts Reached
          </h2>
          <p className="text-gray-600 mb-6">
            You have already used all 2 attempts for this test.
            Please contact your administrator if you need to retake the test.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const submitTest = useCallback((submissionType: 'manual' | 'auto') => {
    // Prevent concurrent submissions
    if (isSubmitting) {
      return;
    }
    
    // Prevent duplicate auto-submissions
    if (submissionType === 'auto' && hasAutoSubmitted) {
      return;
    }
    
    setIsSubmitting(true);
    
    if (submissionType === 'auto') {
      setHasAutoSubmitted(true);
    }
    
    try {
    // Prevent concurrent submissions
    if (isSubmitting) {
      return;
    }
    
    // Prevent duplicate auto-submissions
    if (submissionType === 'auto' && hasAutoSubmitted) {
      return;
    }
    
    setIsSubmitting(true);
    
    if (submissionType === 'auto') {
      setHasAutoSubmitted(true);
    }
    
    try {
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    
    let correctAnswers = 0;
    test.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const totalQuestions = test.questions.length;
    const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    const testAttempt: TestAttempt = {
      id: `attempt-${Date.now()}`,
      userId: state.currentUser!.id,
      testId: test.id,
      answers,
      score: correctAnswers,
      totalQuestions,
      correctAnswers,
      percentage,
      timeSpent,
      completedAt: new Date().toISOString(),
      submissionType
    };

    dispatch({ type: 'ADD_TEST_ATTEMPT', payload: testAttempt });
    onComplete();
    } catch (error) {
      console.error('Error submitting test:', error);
      setIsSubmitting(false);
      if (submissionType === 'auto') {
        setHasAutoSubmitted(false);
      }
      // For auto-submission errors, we should still complete to prevent user from being stuck
      if (submissionType === 'auto') {
        onComplete();
      }
    }
  }, [answers, test, state.currentUser, startTime, dispatch, onComplete, isSubmitting, hasAutoSubmitted]);
      console.error('Error submitting test:', error);
      setIsSubmitting(false);
      if (submissionType === 'auto') {
        setHasAutoSubmitted(false);
      }
      // For auto-submission errors, we should still complete to prevent user from being stuck
      if (submissionType === 'auto') {
        onComplete();
      }
    }
  }, [answers, test, state.currentUser, startTime, dispatch, onComplete, isSubmitting, hasAutoSubmitted]);

  // Timer effect
  useEffect(() => {
    // Don't start timer if already submitted or time is invalid
    if (timeLeft <= 0 || isSubmitting || hasAutoSubmitted) {
      if (timeLeft <= 0 && !hasAutoSubmitted && !isSubmitting) {
        submitTest('auto');
      }
    if (timeLeft <= 0 || isSubmitting || hasAutoSubmitted) {
      if (timeLeft <= 0 && !hasAutoSubmitted && !isSubmitting) {
        submitTest('auto');
      }
      submitTest('auto');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          // Clear interval before submitting to prevent race conditions
          clearInterval(timer);
        if (newTime <= 0) {
          // Clear interval before submitting to prevent race conditions
          clearInterval(timer);
          submitTest('auto');
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitTest, isSubmitting, hasAutoSubmitted]);

  const handleAnswerSelect = (answer: 'A' | 'B' | 'C' | 'D') => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (isSubmitting || hasAutoSubmitted) {
      return;
    }
    if (isSubmitting || hasAutoSubmitted) {
      return;
    }
    setShowSubmitDialog(true);
  };

  const confirmSubmit = () => {
    if (isSubmitting || hasAutoSubmitted) {
      return;
    }
    if (isSubmitting || hasAutoSubmitted) {
      return;
    }
    submitTest('manual');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
            timeLeft <= 300 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
            <p className="text-gray-600">{test.description}</p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {test.questions.length}
            </p>
            <p className="text-sm text-gray-600">
              Answered: {getAnsweredCount()}/{test.questions.length}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {currentQuestion.text}
        </h2>

        <div className="space-y-3">
          {Object.entries(currentQuestion.options).map(([option, text]) => (
            <button
              key={option}
              disabled={isSubmitting}
              onClick={() => handleAnswerSelect(option as 'A' | 'B' | 'C' | 'D')}
              className={`w-full p-4 text-left border-2 rounded-lg transition-all hover:border-amber-300 ${
                answers[currentQuestion.id] === option
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  answers[currentQuestion.id] === option
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {option}
                </span>
                <span className="text-gray-900">{text}</span>
                {answers[currentQuestion.id] === option && (
                  <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />
                )}
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          ))}
        </div>
              disabled={isSubmitting || hasAutoSubmitted}
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0 || isSubmitting}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-3">
            {currentQuestionIndex === test.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || hasAutoSubmitted}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Test'}</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Submit Test?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your test? You have answered {getAnsweredCount()} out of {test.questions.length} questions.
              {getAnsweredCount() < test.questions.length && (
                <span className="text-yellow-600 font-medium">
                  {' '}Unanswered questions will be marked as incorrect.
                </span>
              )}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSubmitDialog(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                disabled={isSubmitting || hasAutoSubmitted}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}