import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Download, Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';

interface TestResultsProps {
  onBack: () => void;
}

export default function TestResults({ onBack }: TestResultsProps) {
  const { state } = useApp();

  const userAttempts = state.testAttempts
    .filter(attempt => attempt.userId === state.currentUser?.id)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  const getTestById = (testId: string) => {
    return state.tests.find(test => test.id === testId);
  };

//   const generatePDFReport = async (attempt: any) => {
//     const test = getTestById(attempt.testId);
//     if (!test) return;

//     // Create a simple text-based report
//     const reportContent = `
// QUIZ PORTAL - TEST RESULT REPORT

// ======================================
// CANDIDATE INFORMATION
// ======================================
// Name: ${state.currentUser?.username}
// Email: ${state.currentUser?.email}
// Candidate ID: ${state.currentUser?.id}

// ======================================
// TEST INFORMATION
// ======================================
// Test Title: ${test.title}
// Category: ${test.category}
// Description: ${test.description}
// Duration: ${test.duration} minutes

// ======================================
// PERFORMANCE SUMMARY
// ======================================
// Date Completed: ${new Date(attempt.completedAt).toLocaleString()}
// Time Spent: ${Math.floor(attempt.timeSpent / 60)}:${String(attempt.timeSpent % 60).padStart(2, '0')}
// Total Questions: ${attempt.totalQuestions}
// Correct Answers: ${attempt.correctAnswers}
// Wrong Answers: ${attempt.totalQuestions - attempt.correctAnswers}
// Final Score: ${attempt.percentage.toFixed(1)}%
// Submission Type: ${attempt.submissionType === 'manual' ? 'Manual Submission' : 'Auto Submission (Time Expired)'}

// ======================================
// DETAILED RESULTS
// ======================================
// ${test.questions.map((question, index) => {
//   const userAnswer = attempt.answers[question.id] || 'Not Answered';
//   const isCorrect = userAnswer === question.correctAnswer;
  
//   return `
// Question ${index + 1}: ${question.text}

// Options:
// A) ${question.options.A}
// B) ${question.options.B}
// C) ${question.options.C}
// D) ${question.options.D}

// Your Answer: ${userAnswer} ${isCorrect ? '✓' : '✗'}
// Correct Answer: ${question.correctAnswer}
// Status: ${isCorrect ? 'CORRECT' : 'INCORRECT'}
// `;
// }).join('\n')}

// ======================================
// GRADE CLASSIFICATION
// ======================================
// ${attempt.percentage >= 90 ? 'EXCELLENT (A+)' :
//   attempt.percentage >= 80 ? 'VERY GOOD (A)' :
//   attempt.percentage >= 70 ? 'GOOD (B)' :
//   attempt.percentage >= 60 ? 'SATISFACTORY (C)' :
//   'NEEDS IMPROVEMENT (F)'}

// ======================================
// CERTIFICATE OF COMPLETION
// ======================================
// This is to certify that ${state.currentUser?.username} has successfully completed the "${test.title}" assessment on ${new Date(attempt.completedAt).toLocaleDateString()} with a score of ${attempt.percentage.toFixed(1)}%.

// Report Generated: ${new Date().toLocaleString()}
// Report ID: ${attempt.id}

// © QuizPortal - Online Examination System
// `;

//     // Create and download the file
//     const blob = new Blob([reportContent], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `${test.title}_Result_${state.currentUser?.username}_${new Date(attempt.completedAt).toLocaleDateString().replace(/\//g, '-')}.txt`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeLabel = (percentage: number) => {
    if (percentage >= 90) return 'Pass - Excellent';
    if (percentage >= 75) return 'Pass - Very Good';
    if (percentage >= 60) return 'Pass - Good';
    if (percentage >= 50) return 'Satisfactory';
    return 'Fail - Needs Improvement';
  };

  const getRemainingAttempts = (testId: string) => {
    const attempts = userAttempts.filter(attempt => attempt.testId === testId);
    return Math.max(0, 2 - attempts.length);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">My Test Results</h1>
      </div>

      {userAttempts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Trophy className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No test results yet</h3>
          <p className="text-gray-500">Take your first test to see your results here!</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Browse Tests
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{userAttempts.length}</p>
                </div>
                <Trophy className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {Math.round(userAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / userAttempts.length)}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Best Score</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {Math.max(...userAttempts.map(a => a.percentage)).toFixed(1)}%
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Time</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatTime(Math.round(userAttempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0) / userAttempts.length))}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {userAttempts.map((attempt) => {
              const test = getTestById(attempt.testId);
              if (!test) return null;

              return (
                <div key={attempt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{test.title}</h3>
                      <p className="text-gray-600 text-sm">{test.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">Category: {test.category}</span>
                        <span className="text-sm text-gray-500">
                          Completed: {new Date(attempt.completedAt).toLocaleString()}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          attempt.submissionType === 'manual'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {attempt.submissionType === 'manual' ? 'Manual Submit' : 'Auto Submit'}
                        </span>
                      </div>
                    </div>
                    
                    {/* <button
                      onClick={() => generatePDFReport(attempt)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Report</span>
                    </button> */}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getGradeColor(attempt.percentage)}`}>
                        {attempt.percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Final Score</div>
                      <div className={`text-xs font-medium mt-1 ${getGradeColor(attempt.percentage)}`}>
                        {getGradeLabel(attempt.percentage)}
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-center text-2xl font-bold text-green-600">
                        <CheckCircle className="w-6 h-6 mr-1" />
                        {attempt.correctAnswers}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Correct</div>
                    </div>
                    
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-center text-2xl font-bold text-red-600">
                        <XCircle className="w-6 h-6 mr-1" />
                        {attempt.totalQuestions - attempt.correctAnswers}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Wrong</div>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center text-2xl font-bold text-blue-600">
                        <Clock className="w-6 h-6 mr-1" />
                        {formatTime(attempt.timeSpent)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Time Taken</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {attempt.totalQuestions}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Total Questions</div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mt-4">
                    Remaining attempts: {getRemainingAttempts(attempt.testId)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}