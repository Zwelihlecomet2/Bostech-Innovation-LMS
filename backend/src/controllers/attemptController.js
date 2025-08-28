const { TestAttempt, Test, Question, User } = require('../models');
const testService = require('../services/testService');
const { AppError, catchAsync } = require('../utils/errorHandler');
const logger = require('../utils/logger');

const submitTestAttempt = catchAsync(async (req, res) => {
  const { testId, answers, timeSpent, submissionType = 'manual' } = req.body;
  const userId = req.user.id;
  
  // Get test with questions and correct answers
  const test = await testService.getTestById(testId, true);
  
  if (!test) {
    throw new AppError('Test not found', 404);
  }
  
  if (!test.isActive) {
    throw new AppError('Test is not active', 400);
  }
  
  // Check attempt limit
  const existingAttempts = await TestAttempt.count({
    where: { userId, testId }
  });
  
  if (existingAttempts >= test.maxAttempts) {
    throw new AppError(`Maximum ${test.maxAttempts} attempts allowed`, 400);
  }
  
  // Calculate score
  let correctAnswers = 0;
  const totalQuestions = test.questions.length;
  
  test.questions.forEach(question => {
    const userAnswer = answers[question.id];
    if (userAnswer === question.correctAnswer) {
      correctAnswers++;
    }
  });
  
  const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  
  // Create test attempt
  const attempt = await TestAttempt.create({
    userId,
    testId,
    answers,
    score: correctAnswers,
    totalQuestions,
    correctAnswers,
    percentage: parseFloat(percentage.toFixed(2)),
    timeSpent,
    submissionType,
    completedAt: new Date()
  });
  
  logger.info('Test attempt submitted', {
    attemptId: attempt.id,
    userId,
    testId,
    score: correctAnswers,
    percentage: percentage.toFixed(2)
  });
  
  // Return attempt with test info
  const attemptWithTest = await TestAttempt.findByPk(attempt.id, {
    include: [{
      model: Test,
      as: 'test',
      attributes: ['id', 'title', 'category', 'duration']
    }]
  });
  
  res.status(201).json({
    success: true,
    message: 'Test submitted successfully',
    data: { attempt: attemptWithTest }
  });
});

const getUserAttempts = catchAsync(async (req, res) => {
  const { testId } = req.query;
  const userId = req.user.id;
  
  const attempts = await testService.getUserAttempts(userId, testId);
  
  res.status(200).json({
    success: true,
    data: { attempts }
  });
});

const getAttemptById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;
  
  const whereClause = { id };
  
  // Non-admin users can only see their own attempts
  if (userRole !== 'admin') {
    whereClause.userId = userId;
  }
  
  const attempt = await TestAttempt.findOne({
    where: whereClause,
    include: [{
      model: Test,
      as: 'test',
      attributes: ['id', 'title', 'category', 'duration'],
      include: [{
        model: Question,
        as: 'questions',
        attributes: ['id', 'questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer']
      }]
    }, {
      model: User,
      as: 'user',
      attributes: ['id', 'username', 'email']
    }]
  });
  
  if (!attempt) {
    throw new AppError('Test attempt not found', 404);
  }
  
  // Transform the response to match frontend format
  const transformedAttempt = {
    ...attempt.toJSON(),
    test: {
      ...attempt.test.toJSON(),
      questions: attempt.test.questions.map(q => ({
        id: q.id,
        text: q.questionText,
        options: {
          A: q.optionA,
          B: q.optionB,
          C: q.optionC,
          D: q.optionD
        },
        correctAnswer: q.correctAnswer
      }))
    }
  };
  
  res.status(200).json({
    success: true,
    data: { attempt: transformedAttempt }
  });
});

const getAllAttempts = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, testId, userId } = req.query;
  
  const whereClause = {};
  if (testId) whereClause.testId = testId;
  if (userId) whereClause.userId = userId;
  
  const offset = (page - 1) * limit;
  
  const { count, rows: attempts } = await TestAttempt.findAndCountAll({
    where: whereClause,
    include: [{
      model: Test,
      as: 'test',
      attributes: ['id', 'title', 'category']
    }, {
      model: User,
      as: 'user',
      attributes: ['id', 'username', 'email']
    }],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['completedAt', 'DESC']]
  });
  
  res.status(200).json({
    success: true,
    data: {
      attempts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalAttempts: count,
        hasNext: offset + attempts.length < count,
        hasPrev: page > 1
      }
    }
  });
});

const getAttemptStats = catchAsync(async (req, res) => {
  const { testId } = req.query;
  const userId = req.user.role === 'admin' ? null : req.user.id;
  
  const whereClause = {};
  if (testId) whereClause.testId = testId;
  if (userId) whereClause.userId = userId;
  
  const attempts = await TestAttempt.findAll({
    where: whereClause,
    attributes: ['percentage', 'timeSpent', 'submissionType']
  });
  
  if (attempts.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        totalAttempts: 0,
        averageScore: 0,
        topScore: 0,
        averageTime: 0
      }
    });
  }
  
  const totalAttempts = attempts.length;
  const averageScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts;
  const topScore = Math.max(...attempts.map(attempt => attempt.percentage));
  const averageTime = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0) / totalAttempts;
  
  res.status(200).json({
    success: true,
    data: {
      totalAttempts,
      averageScore: Math.round(averageScore),
      topScore,
      averageTime: Math.round(averageTime / 60) // Convert to minutes
    }
  });
});

module.exports = {
  submitTestAttempt,
  getUserAttempts,
  getAttemptById,
  getAllAttempts,
  getAttemptStats
};