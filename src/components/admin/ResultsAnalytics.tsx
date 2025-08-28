import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, Download, Users, Trophy, Clock, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import bostechLogo from "../../assets/bostech-logo.jpg";

interface Question {
  id: string;
  text: string;
  options: Record<string, string>;
  correctAnswer: string;
}

interface Test {
  id: string;
  title: string;
  category?: string;
  questions: Record<string, Question>;
}

interface TestAttempt {
  id: string;
  testId: string;
  userId: string;
  answers: Record<string, string>;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
  submissionType: 'manual' | 'auto';
}

export default function ResultsAnalytics() {
  const { state } = useApp();
  const [selectedTest, setSelectedTest] = useState<string>('all');
  const [downloadingReports, setDownloadingReports] = useState<Set<string>>(new Set());
  const [downloadErrors, setDownloadErrors] = useState<Record<string, string>>({});
  const [downloadSuccess, setDownloadSuccess] = useState<Record<string, boolean>>({});

  const filteredAttempts = selectedTest === 'all' 
    ? state.testAttempts 
    : state.testAttempts.filter(attempt => attempt.testId === selectedTest);

  const stats = {
    totalAttempts: filteredAttempts.length,
    averageScore: filteredAttempts.length > 0 
      ? Math.round(filteredAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / filteredAttempts.length)
      : 0,
    topScore: filteredAttempts.length > 0 
      ? Math.max(...filteredAttempts.map(attempt => attempt.percentage))
      : 0,
    averageTime: filteredAttempts.length > 0 
      ? Math.round(filteredAttempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0) / filteredAttempts.length / 60)
      : 0
  };

  const getUserById = (userId: string) => {
    return state.users.find(user => user.id === userId);
  };

  const getTestById = (testId: string): Test | undefined => {
    return state.tests.find(test => test.id === testId) as Test | undefined;
  };

  const generatePDFReport = async (attempt: TestAttempt) => {
    const reportId = attempt.id;
    
    // Clear previous states
    setDownloadErrors(prev => ({ ...prev, [reportId]: '' }));
    setDownloadSuccess(prev => ({ ...prev, [reportId]: false }));
    
    // Set loading state
    setDownloadingReports(prev => new Set([...prev, reportId]));
    
    try {
      if (!attempt) {
        throw new Error('Invalid test attempt data');
      }
      
      const test = getTestById(attempt.testId);
      const user = getUserById(attempt.userId);
      
      if (!test || !user) {
        throw new Error('Test or user data not found');
      }
      
      // Validate data before PDF generation
      if (!test.questions || test.questions.length === 0) {
        throw new Error('No questions found for this test');
      }

      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create PDF document
      const doc = new jsPDF('p', 'mm', 'a4');
      
      try {
        // Add header with styling and logo
        doc.setFillColor(245, 158, 11); // Amber color
        doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
        
        // Add Bostech logo - convert to base64 first
        const logoBase64 = await new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Canvas context not available'));
              return;
            }
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
          };
          img.onerror = () => reject(new Error('Image failed to load'));
          img.src = bostechLogo;
        }).catch(() => null);
        
        if (logoBase64) {
          try {
            doc.addImage(logoBase64, 'JPEG', 20, 5, 30, 30);
          } catch (logoError) {
            console.warn('Failed to add logo to PDF:', logoError);
          }
        }
        
        // Add company name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('Bostech Training', 60, 25);
        
        doc.setFontSize(16);
        doc.text('Test Result Report', doc.internal.pageSize.width / 2, 35, { align: 'center' });
        
        // Reset text color for rest of content
        doc.setTextColor(0, 0, 0);
        
        // Add test and user information with better formatting
        doc.setFontSize(12);
        doc.text('Test Details', 20, 50);
        doc.setDrawColor(245, 158, 11);
        doc.line(20, 52, 190, 52);
        
        doc.setFontSize(10);
        doc.text(`Test Name: ${test.title}`, 20, 65);
        doc.text(`Category: ${test.category || 'N/A'}`, 20, 75);
        doc.text(`User: ${user.username}`, 20, 85);
        doc.text(`Email: ${user.email}`, 20, 95);
        doc.text(`Completion Date: ${new Date(attempt.completedAt).toLocaleString()}`, 20, 105);
        
        // Add score information with styling
        doc.setFontSize(12);
        doc.text('Performance Summary', 20, 120);
        doc.line(20, 122, 190, 122);
        
        doc.setFontSize(10);
        // Create score box with lighter color
        doc.setFillColor(255, 250, 240); // Very light amber/orange
        doc.roundedRect(20, 130, 170, 30, 3, 3, 'F');
        // Add a subtle border
        doc.setDrawColor(245, 158, 11);
        doc.roundedRect(20, 130, 170, 30, 3, 3);
        doc.text(`Score: ${attempt.percentage.toFixed(1)}%`, 30, 140);
        doc.text(`Correct Answers: ${attempt.correctAnswers}/${attempt.totalQuestions}`, 30, 150);
        
        const mins = Math.floor(attempt.timeSpent / 60);
        const secs = attempt.timeSpent % 60;
        doc.text(`Time Spent: ${mins}:${String(secs).padStart(2, '0')}`, 120, 140);
        
        // Add answers table with better styling
        doc.text('Detailed Answers', 20, 175);
        doc.line(20, 177, 190, 177);
        
        // Process questions and answers with validation
        const tableData = test.questions.map((question, index) => {
          // Get the selected answer (A, B, C, or D)
          const selectedOption = attempt.answers[question.id];
          const correctOption = question.correctAnswer;
          
          // Get the full text of the selected and correct answers
          const selectedAnswerText = selectedOption ? question.options[selectedOption] : 'Not Selected';
          const correctAnswerText = question.options[correctOption];
          
          // Compare the selected option with correct option
          const isCorrect = String(selectedOption) === String(correctOption);
          
          return [
            `Q${index + 1}: ${question.text.substring(0, 100)}${question.text.length > 100 ? '...' : ''}`,
            selectedAnswerText.substring(0, 50) + (selectedAnswerText.length > 50 ? '...' : ''),
            correctAnswerText.substring(0, 50) + (correctAnswerText.length > 50 ? '...' : ''),
            isCorrect ? 'Correct' : 'Incorrect'
          ];
        });
        
        autoTable(doc, {
          startY: 185,
          head: [['Question', 'Selected Answer', 'Correct Answer', 'Status']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: '#f59e0b',
            textColor: '#ffffff',
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 40 },
            2: { cellWidth: 40 },
            3: { cellWidth: 20 }
          },
          styles: {
            fontSize: 8,
            cellPadding: 3,
            overflow: 'linebreak',
            cellWidth: 'wrap'
          },
          alternateRowStyles: {
            fillColor: '#fff7ed'
          }
        });
      } catch (pdfError) {
        throw new Error(`PDF generation failed: ${pdfError.message}`);
      }
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const sanitizedTestTitle = test.title.replace(/[^a-zA-Z0-9]/g, '_');
      const sanitizedUsername = user.username.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${sanitizedTestTitle}_${sanitizedUsername}_Report_${timestamp}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      // Show success message
      setDownloadSuccess(prev => ({ ...prev, [reportId]: true }));
      setTimeout(() => {
        setDownloadSuccess(prev => ({ ...prev, [reportId]: false }));
      }, 3000);
      
    } catch (error) {
      console.error('Error generating PDF report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate PDF report';
      setDownloadErrors(prev => ({ ...prev, [reportId]: errorMessage }));
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setDownloadErrors(prev => ({ ...prev, [reportId]: '' }));
      }, 5000);
    } finally {
      // Remove loading state
      setDownloadingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const isDownloading = (attemptId: string) => downloadingReports.has(attemptId);
  const hasError = (attemptId: string) => !!downloadErrors[attemptId];
  const hasSuccess = (attemptId: string) => !!downloadSuccess[attemptId];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Results & Analytics</h2>
          <p className="text-gray-600 text-sm">View test performance and analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="all">All Tests</option>
            {state.tests.map(test => (
              <option key={test.id} value={test.id}>
                {test.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Attempts', value: stats.totalAttempts, icon: Users, color: 'bg-amber-500' },
          { title: 'Average Score', value: `${stats.averageScore}%`, icon: BarChart3, color: 'bg-amber-500' },
          { title: 'Top Score', value: `${stats.topScore}%`, icon: Trophy, color: 'bg-amber-500' },
          { title: 'Avg Time', value: `${stats.averageTime}m`, icon: Clock, color: 'bg-amber-500' }
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
        {filteredAttempts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <BarChart3 className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
            <p className="text-gray-500">
              {selectedTest === 'all' 
                ? 'No test attempts have been made yet.'
                : 'No attempts found for the selected test.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-amber-50 border-b border-amber-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Download Report
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {filteredAttempts
                  .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                  .map((attempt) => {
                    const user = getUserById(attempt.userId);
                    const test = getTestById(attempt.testId);
                    return (
                      <tr key={attempt.id} className="hover:bg-amber-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user?.username || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500">{user?.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {test?.title || 'Unknown Test'}
                            </div>
                            <div className="text-sm text-gray-500">{test?.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`text-sm font-medium ${
                              attempt.percentage >= 80 ? 'text-green-600' :
                              attempt.percentage >= 60 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {
                              attempt.percentage >= 50 ? 'Passed' :
                              attempt.percentage < 50 ? 'Failed' : 'Not Attempted'
                              }
                              <div></div>{attempt.percentage.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500 ml-2">
                              ({attempt.correctAnswers}/{attempt.totalQuestions})
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Math.floor(attempt.timeSpent / 60)}:{String(attempt.timeSpent % 60).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(attempt.completedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            attempt.submissionType === 'manual'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {attempt.submissionType === 'manual' ? 'Manual' : 'Auto'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => generatePDFReport(attempt)}
                            disabled={isDownloading(attempt.id)}
                            className={`flex items-center space-x-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              hasError(attempt.id) 
                                ? 'text-red-600 hover:text-red-800' 
                                : hasSuccess(attempt.id)
                                ? 'text-green-600 hover:text-green-800'
                                : 'text-amber-600 hover:text-amber-800'
                            }`}
                          >
                            {isDownloading(attempt.id) ? (
                              <>
                                <Loader className="w-4 h-4 animate-spin" />
                                <span>Generating...</span>
                              </>
                            ) : hasError(attempt.id) ? (
                              <>
                                <AlertCircle className="w-4 h-4" />
                                <span>Retry</span>
                              </>
                            ) : hasSuccess(attempt.id) ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span>Downloaded</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                              </>
                            )}
                          </button>
                          {hasError(attempt.id) && (
                            <div className="text-xs text-red-600 mt-1 max-w-32 truncate" title={downloadErrors[attempt.id]}>
                              {downloadErrors[attempt.id]}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}