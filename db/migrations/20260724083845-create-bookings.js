/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bookings', {
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

      userId: {
        type: Sequelize.UUID,
        allowNull: false,

        references: {
          model: 'users',
          key: 'id',
        },

        onDelete: 'CASCADE',
      },

      startDateTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      endDateTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM(
          'PENDING',
          'CONFIRMED',
          'CANCELLED',
          'COMPLETED',
          'NO_SHOW',
        ),
        allowNull: false,
        defaultValue: 'CONFIRMED',
      },

      meetingLink: Sequelize.STRING,

      cancelledBy: {
        type: Sequelize.UUID,
        allowNull: true,
      },

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.addIndex('bookings', [
      'mentorId',
      'startDateTime',
    ]);

    await queryInterface.addIndex('bookings', [
      'userId',
    ]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('bookings');
  },
};
