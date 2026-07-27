import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });

      this.belongsTo(models.MentorProfile, {
        foreignKey: 'mentorId',
        as: 'mentorProfile',
      });
    }
  }

  Booking.init({
    mentorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    startDateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    endDateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        'PENDING',
        'CONFIRMED',
        'CANCELLED',
        'COMPLETED',
        'NO_SHOW',
      ),
      allowNull: false,
      defaultValue: 'PENDING',
    },

    meetingLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    cancelledBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    indexes: [
      {
        fields: ['mentorId', 'startDateTime'],
      },
      {
        fields: ['userId'],
      },
    ],
  });

  return Booking;
};
