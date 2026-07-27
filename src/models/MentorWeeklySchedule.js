import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class MentorWeeklySchedule extends Model {
    static associate(models) {
      this.belongsTo(models.MentorProfile, {
        foreignKey: 'mentorId',
        as: 'mentorProfile',
      });
    }
  }

  MentorWeeklySchedule.init({
    mentorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    dayOfWeek: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: {
        min: 0,
        max: 6,
      },
    },

    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'MentorWeeklySchedule',
    tableName: 'mentorWeeklySchedule',
  });

  return MentorWeeklySchedule;
};
