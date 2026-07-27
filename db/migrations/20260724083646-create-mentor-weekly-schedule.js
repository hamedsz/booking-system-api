/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mentorWeeklySchedule', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal(
          'gen_random_uuid()',
        ),
      },

      mentorId: {
        type: Sequelize.UUID,
        allowNull: false,

        references: {
          model: 'mentorProfiles',
          key: 'id',
        },

        onDelete: 'CASCADE',
      },

      dayOfWeek: {
        type: Sequelize.SMALLINT,
        allowNull: false,
      },

      startTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      endTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.addConstraint('mentorWeeklySchedule', {
      fields: ['mentorId', 'dayOfWeek'],
      type: 'unique',
      name: 'mentorWeeklyScheduleUnique',
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('mentorWeeklySchedule');
  },
};
