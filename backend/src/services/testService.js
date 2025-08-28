const { Test, Question, TestAttempt, User } = require('../models');
const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class TestService {
  async createTest(testData, createdBy) {
    try {
      const { questions, ...testInfo } = testData;

      // Create test
      const test = await Test.create({
        ...testInfo,
        createdBy
      });

      // Create questions
      const questionsWithTestId = questions.map((question, index) => ({
        testId: test.id,
        questionText: question.text,
        optionA: question.options.A,
        optionB: question.options.B,
        optionC: question.options.C,
        optionD: question.options.D,
        correctAnswer: question.correctAnswer,
        questionOrder: index + 1
      }));

      await Question.bulkCreate(questionsWithTestId);

      // Fetch complete test with questions
      const completeTest = await this.getTestById(test.id);
      
      logger.info('Test created successfully', { testId: test.id, createdBy });
      return completeTest;
    } catch (error) {
      logger.error('Failed to create test', error);
      throw error;
    }
  }

  async updateTest(testId, testData, userId) {
    try {
      const test = await Test.findByPk(testId);
      
      if (!test) {
        throw new AppError('Test not found', 404);
      }

      // Check if user is admin or test creator
      if (test.createdBy !== userId) {
        const user = await User.findByPk(userId);
        if (user.role !== 'admin') {
          throw new AppError('Not authorized to update this test', 403);
        }
      }

      const { questions, ...testInfo } = testData;

      // Update test info
      await test.update(testInfo);

      // Update questions if provided
      if (questions) {
        // Delete existing questions
        await Question.destroy({ where: { testId } });

        // Create new questions
        const questionsWithTestId = questions.map((question, index) => ({
          testId: test.id,
          questionText: question.text,
          optionA: question.options.A,
          optionB: question.options.B,
          optionC: question.options.C,
          optionD: question.options.D,
          correctAnswer: question.correctAnswer,
          questionOrder: index + 1
        }));

        await Question.bulkCreate(questionsWithTestId);
      }

      // Fetch updated test
      const updatedTest = await this.getTestById(testId);
      
      logger.info('Test updated successfully', { testId, updatedBy: userId });
      return updatedTest;
    } catch (error) {
      logger.error('Failed to update test', error);
      throw error;
    }
  }

  async getTestById(testId, includeAnswers = false) {
    try {
      const test = await Test.findByPk(testId, {
        include: [{
          model: Question,
          as: 'questions',
          attributes: includeAnswers 
            ? undefined 
            : { exclude: ['correctAnswer'] },
          order: [['questionOrder', 'ASC']]
        }, {
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        }]
      });

      if (!test) {
        throw new AppError('Test not found', 404);
      }

      // Transform questions to match frontend format
      const transformedTest = {
        id: test.id,
        title: test.title,
        description: test.description,
        category: test.category,
        duration: test.duration,
        isActive: test.isActive,
        maxAttempts: test.maxAttempts,
        createdAt: test.createdAt,
        createdBy: test.createdBy,
        creator: test.creator,
        questions: test.questions.map(q => ({
          id: q.id,
          text: q.questionText,
          options: {
            A: q.optionA,
            B: q.optionB,
            C: q.optionC,
            D: q.optionD
          },
          ...(includeAnswers && { correctAnswer: q.correctAnswer })
        }))
      };

      return transformedTest;
    } catch (error) {
      logger.error('Failed to get test', error);
      throw error;
    }
  }

  async getAllTests(userId, userRole, filters = {}) {
    try {
      const whereClause = {};
      
      // Non-admin users can only see active tests
      if (userRole !== 'admin') {
        whereClause.isActive = true;
      }

      // Apply filters
      if (filters.category) {
        whereClause.category = { [Op.iLike]: `%${filters.category}%` };
      }
      
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }

      const tests = await Test.findAll({
        where: whereClause,
        include: [{
          model: Question,
          as: 'questions',
          attributes: ['id'], // Only count questions
        }, {
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        }],
        order: [['createdAt', 'DESC']]
      });

      // Transform tests and add question count
      const transformedTests = tests.map(test => ({
        id: test.id,
        title: test.title,
        description: test.description,
        category: test.category,
        duration: test.duration,
        isActive: test.isActive,
        maxAttempts: test.maxAttempts,
        createdAt: test.createdAt,
        createdBy: test.createdBy,
        creator: test.creator,
        questionCount: test.questions.length
      }));

      return transformedTests;
    } catch (error) {
      logger.error('Failed to get tests', error);
      throw error;
    }
  }

  async deleteTest(testId, userId) {
    try {
      const test = await Test.findByPk(testId);
      
      if (!test) {
        throw new AppError('Test not found', 404);
      }

      // Check if user is admin or test creator
      if (test.createdBy !== userId) {
        const user = await User.findByPk(userId);
        if (user.role !== 'admin') {
          throw new AppError('Not authorized to delete this test', 403);
        }
      }

      // Check if test has attempts
      const attemptCount = await TestAttempt.count({
        where: { testId }
      });

      if (attemptCount > 0) {
        throw new AppError('Cannot delete test with existing attempts', 400);
      }

      await test.destroy();
      
      logger.info('Test deleted successfully', { testId, deletedBy: userId });
      return { message: 'Test deleted successfully' };
    } catch (error) {
      logger.error('Failed to delete test', error);
      throw error;
    }
  }

  async getUserAttempts(userId, testId = null) {
    try {
      const whereClause = { userId };
      if (testId) {
        whereClause.testId = testId;
      }

      const attempts = await TestAttempt.findAll({
        where: whereClause,
        include: [{
          model: Test,
          as: 'test',
          attributes: ['id', 'title', 'category', 'duration']
        }],
        order: [['completedAt', 'DESC']]
      });

      return attempts;
    } catch (error) {
      logger.error('Failed to get user attempts', error);
      throw error;
    }
  }
}

module.exports = new TestService();