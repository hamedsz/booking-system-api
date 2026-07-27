/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mentorProfiles', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal(
          'gen_random_uuid()',
        ),
      },

      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,

        references: {
          model: 'users',
          key: 'id',
        },

        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      bio: Sequelize.TEXT,

      timezone: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'UTC',
      },

      meetingDurationMinutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },

      isAcceptingBookings: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('mentorProfiles');
  },
};
