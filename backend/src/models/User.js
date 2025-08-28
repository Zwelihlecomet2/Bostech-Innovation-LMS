const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash'
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user',
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'login_attempts'
    },
    lastLogin: {
      type: DataTypes.DATE,
      field: 'last_login'
    }
  }, {
    tableName: 'users',
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.passwordHash = await bcrypt.hash(user.password, 12);
          delete user.password;
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password') && user.password) {
          user.passwordHash = await bcrypt.hash(user.password, 12);
          delete user.password;
        }
      }
    }
  });

  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.passwordHash);
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.passwordHash;
    return values;
  };

  return User;
};