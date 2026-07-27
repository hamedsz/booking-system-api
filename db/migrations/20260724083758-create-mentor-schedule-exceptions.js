/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mentorScheduleExceptions', {
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

      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      type: {
        type: Sequelize.ENUM(
          'DAY_OFF',
          'CUSTOM_HOURS',
        ),
        allowNull: false,
      },

      startTime: Sequelize.TIME,

      endTime: Sequelize.TIME,

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.addConstraint(
      'mentorScheduleExceptions',
      {
        fields: ['mentorId', 'date'],
        type: 'unique',
        name: 'mentorScheduleExceptionsUnique',
      },
    );
  },
  async down(queryInterface) {
    await queryInterface.dropTable('mentorScheduleExceptions');
  },
};
