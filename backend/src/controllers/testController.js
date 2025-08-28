const testService = require('../services/testService');
const { catchAsync } = require('../utils/errorHandler');

const getAllTests = catchAsync(async (req, res) => {
  const { category, isActive } = req.query;
  
  const filters = {};
  if (category) filters.category = category;
  if (isActive !== undefined) filters.isActive = isActive === 'true';
  
  const tests = await testService.getAllTests(req.user.id, req.user.role, filters);
  
  res.status(200).json({
    success: true,
    data: { tests }
  });
});

const getTestById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { includeAnswers } = req.query;
  
  // Only admins can see answers
  const showAnswers = req.user.role === 'admin' && includeAnswers === 'true';
  
  const test = await testService.getTestById(id, showAnswers);
  
  res.status(200).json({
    success: true,
    data: { test }
  });
});

const createTest = catchAsync(async (req, res) => {
  const test = await testService.createTest(req.body, req.user.id);
  
  res.status(201).json({
    success: true,
    message: 'Test created successfully',
    data: { test }
  });
});

const updateTest = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const test = await testService.updateTest(id, req.body, req.user.id);
  
  res.status(200).json({
    success: true,
    message: 'Test updated successfully',
    data: { test }
  });
});

const deleteTest = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  await testService.deleteTest(id, req.user.id);
  
  res.status(200).json({
    success: true,
    message: 'Test deleted successfully'
  });
});

module.exports = {
  getAllTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest
};