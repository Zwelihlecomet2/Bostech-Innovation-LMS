const sequelize = require('../config/database');
const User = require('./User')(sequelize);
const Test = require('./Test')(sequelize);
const Question = require('./Question')(sequelize);
const TestAttempt = require('./TestAttempt')(sequelize);
const UserSession = require('./UserSession')(sequelize);

// Define associations
User.hasMany(Test, { foreignKey: 'created_by', as: 'createdTests' });
Test.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Test.hasMany(Question, { foreignKey: 'test_id', as: 'questions' });
Question.belongsTo(Test, { foreignKey: 'test_id', as: 'test' });

User.hasMany(TestAttempt, { foreignKey: 'user_id', as: 'attempts' });
TestAttempt.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Test.hasMany(TestAttempt, { foreignKey: 'test_id', as: 'attempts' });
TestAttempt.belongsTo(Test, { foreignKey: 'test_id', as: 'test' });

User.hasMany(UserSession, { foreignKey: 'user_id', as: 'sessions' });
UserSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Test,
  Question,
  TestAttempt,
  UserSession
};