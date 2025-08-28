const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Question = sequelize.define('Question', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    testId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'test_id'
    },
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'question_text',
      validate: {
        notEmpty: true
      }
    },
    optionA: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'option_a',
      validate: {
        notEmpty: true
      }
    },
    optionB: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'option_b',
      validate: {
        notEmpty: true
      }
    },
    optionC: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'option_c',
      validate: {
        notEmpty: true
      }
    },
    optionD: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'option_d',
      validate: {
        notEmpty: true
      }
    },
    correctAnswer: {
      type: DataTypes.ENUM('A', 'B', 'C', 'D'),
      allowNull: false,
      field: 'correct_answer'
    },
    questionOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'question_order'
    }
  }, {
    tableName: 'questions',
    underscored: true,
    updatedAt: false
  });

  return Question;
};