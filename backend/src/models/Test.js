const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Test = sequelize.define('Test', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 300
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    maxAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
      field: 'max_attempts',
      validate: {
        min: 1,
        max: 10
      }
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'created_by'
    }
  }, {
    tableName: 'tests',
    underscored: true
  });

  return Test;
};