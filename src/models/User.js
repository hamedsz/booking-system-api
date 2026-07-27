import { createSecretKey } from 'crypto';
import { Model } from 'sequelize';
import bcrypt from 'bcrypt';
import { EncryptJWT, jwtDecrypt } from 'jose';
import { ENV_BACKEND_HOST, JWT_SECRET_USER_MODEL } from '../config/app';
import { TOKEN_EXPIRATION, TOKEN_TYPE } from '../constants/user';

const secretKey = createSecretKey(Buffer.from(JWT_SECRET_USER_MODEL, 'hex'));

export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate() {
    }

    /**
     * Checks if raw password is correct, comparing hash.
     *
     * @param {String} rawPassword
     *
     * @returns {Promise<Boolean>|Boolean}
     */
    validPassword(rawPassword) {
      // when the user have not set the password yet.
      // This is due to the use has yet to acept the invitation
      if (this.password === null) {
        return false;
      }

      return bcrypt.compare(rawPassword, this.password);
    }

    /**
     * Verify jwt token and return the claims.
     *
     * @static
     * @param {String} jwtToken
     * @param {String} [issuer=ENV_BACKEND_HOST]
     *
     * @returns {Promise<Object>}
     */
    static async jwtVerify(jwtToken, issuer = ENV_BACKEND_HOST) {
      const { payload } = await jwtDecrypt(jwtToken, secretKey, {
        issuer,
        audience: issuer,
      });

      return payload;
    }

    /**
     * Create jwt token.
     *
     * @param {Object} extras
     * @param {Boolean} [isRefreshedToken=false]
     * @param {String} [issuer=ENV_BACKEND_HOST]
     *
     * @returns {Promise<String>}
     */
    async jwtSign(extras, issuer = ENV_BACKEND_HOST) {
      const payload = {
        ...extras,
        tokenType: TOKEN_TYPE.ACCESS,
      };
      const expiration = TOKEN_EXPIRATION.FIFTEEN_MINUTES;

      return this.generateJWT(payload, expiration, issuer);
    }

    /**
     * generate JWT token
     * @private
     * @param {Object} payload
     * @param {String} expiration
     * @param {String} [issuer = ENV_BACKEND_HOST]
     * @returns {Promise<String>}
     */
    async generateJWT(payload, expiration, issuer = ENV_BACKEND_HOST) {
      return new EncryptJWT(payload)
        .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
        .setIssuedAt()
        .setIssuer(issuer)
        .setAudience(issuer)
        .setSubject(this.id)
        .setExpirationTime(expiration)
        .encrypt(secretKey);
    }

    /**
     * Generate refresh token
     * @returns {Promise<String>}
     */
    async getRefreshToken(expiration) {
      const payload = {
        id: this.id,
        tokenType: TOKEN_TYPE.REFRESH,
      };

      return this.generateJWT(payload, expiration);
    }
  }

  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN,
    role: DataTypes.ENUM('user', 'admin', 'mentor'),
    password: {
      type: DataTypes.STRING,
      allowNull: true,
      set(value) {
        // Hash the password before saving
        if (value) {
          const salt = bcrypt.genSaltSync(10);
          this.setDataValue('password', bcrypt.hashSync(value, salt));
        }
      },
    },
  }, {
    hooks: {
      beforeUpdate: async (user) => {
        // Only hash the password if it has been modified
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(10);
          // eslint-disable-next-line no-param-reassign
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
    sequelize,
    modelName: 'User',
    tableName: 'users',
  });
  return User;
};
