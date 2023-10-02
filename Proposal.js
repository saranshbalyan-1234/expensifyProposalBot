export default (sequelize, DataTypes) => {
    const User = sequelize.define(
      "proposals",
      {
        search: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notNull: true,
          },
        },
        proposal: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
            notNull: true,
          },
        },
      }
    );

    return User;
  };