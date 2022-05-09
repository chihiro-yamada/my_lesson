'use strict';

const bcrypt = require('bcrypt');

const throwValidationError = (message, itemMessage) => {
  const error = new ValidationError(message, [
    new ValidationErrorItem(itemMessage)
  ]);
  throw error;
};

const {
  Model, ValidationError, ValidationErrorItem
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(_models) {
      // define association here
    }

    static async generateHash(password) {
      return await bcrypt.hash(password, 10);
    }

    static async register({ username, email, displayName, password, role = 0 }) {
      if(!password) {
        throwValidationError('ユーザ新規登録に失敗しました', 'パスワードは必須です');
      }
      const passwordHash = await this.generateHash(password);
      
      const user = this.build({ passwordHash, username, email, displayName, role });
      await user.save();
      return user;
    }
    
    static async authenticate({ username, password }) {
      const errorMessage = 'ログインに失敗しました';
      if(!username) {
        throwValidationError(errorMessage, 'usernameは必須です');
      }
      if(!password) {
        throwValidationError(errorMessage, 'passwordは必須です');
      }

      const user = await this.findOne({ where: { username } });
      if (!user) { throwValidationError(errorMessage, 'ユーザーネームとパスワードが一致しません'); }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) { throwValidationError(errorMessage, 'ユーザーネームとパスワードが一致しません'); }
      return user;
    }

    isAdmin() {
      return this.role === this.constructor.roles.admin;
    }
  }
  User.roles = { normal: 0, admin: 1 };
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'usernameは必須です'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: 'フォーマットがEmailとして認められません'
        },
        notEmpty: {
          msg: 'emailは必須です'
        }
      }
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '表示名は必須です'
        },
        len: {
          msg: '表示名は3文字以上24文字未満です',
          args: [3, 24]
        }
      }
    },
    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: User.roles.normal,
      validate: {
        notEmpty: {
          msg: '役割は必須です'
        },
        isIn: {
          msg: `役割は${Object.values(User.roles).join(',')}のいずれかです`,
          args: [Object.values(User.roles)]
        }
      }
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};