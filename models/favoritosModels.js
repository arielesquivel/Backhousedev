const { Sequelize, Model, DataTypes } = require("sequelize");
const db = require("../db");

class Favorito extends Model {}
Favorito.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    propiedad_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: "favorito",
  }
);

module.exports = Favorito;
