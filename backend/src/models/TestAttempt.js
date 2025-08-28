const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TestAttempt = sequelize.define('TestAttempt', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    testId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'test_id'
    },
    answers: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    totalQuestions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'total_questions',
      validate: {
        min: 1
      }
    },
    correctAnswers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'correct_answers',
      validate: {
        min: 0
      }
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'time_spent',
      validate: {
        min: 0
      }
    },
    submissionType: {
      type: DataTypes.ENUM('manual', 'auto'),
      defaultValue: 'manual',
      field: 'submission_type'
    },
    startedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'started_at'
    },
    completedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'completed_at'
    }
  }, {
    tableName: 'test_attempts',
    underscored: true,
    createdAt: 'started_at',
    updatedAt: false
  });

  return TestAttempt;
};