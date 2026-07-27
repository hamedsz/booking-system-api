import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class MentorScheduleException extends Model {
    static associate(models) {
      this.belongsTo(models.MentorProfile, {
        foreignKey: 'mentorId',
        as: 'mentorProfile',
      });
    }
  }

  MentorScheduleException.init({
    mentorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM(
        'DAY_OFF',
        'CUSTOM_HOURS',
      ),
      allowNull: false,
    },

    startTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    endTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'MentorScheduleException',
    tableName: 'mentorScheduleExceptions',
  });

  return MentorScheduleException;
};
