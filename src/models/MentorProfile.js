import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class MentorProfile extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });

      this.hasMany(models.MentorWeeklySchedule, {
        foreignKey: 'mentorId',
        as: 'weeklySchedules',
      });

      this.hasMany(models.MentorScheduleException, {
        foreignKey: 'mentorId',
        as: 'scheduleExceptions',
      });

      this.hasMany(models.Booking, {
        foreignKey: 'mentorId',
        as: 'bookings',
      });
    }
  }

  MentorProfile.init(
    {
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      timezone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'UTC',
      },

      meetingDurationMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },

      isAcceptingBookings: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'MentorProfile',
      tableName: 'mentorProfiles',
    },
  );

  return MentorProfile;
};
