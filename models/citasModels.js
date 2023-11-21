const { Sequelize, Model, DataTypes } = require("sequelize");
const db = require("../db");

class Cita extends Model {}

Cita.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    propiedad_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize: db,
    modelName: "cita",
  }
);

module.exports = Cita;
