const { Sequelize, Model, DataTypes } = require("sequelize");
const db = require("../db");
const { propiedadesModels } = require(".");

propiedadesModels.init(
  {
    categorita: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    User_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ambientes: {
      type: DataTypes.INTEGER,
    },
    disponibilidad: {
      type: DataTypes.BOOLEAN,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    localidad: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    localizacion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    precio: {
      type: DataTypes.DOUBLE,
    },
    Image: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: "propiedadesModels",
  }
);

module.exports = propiedadesModels;
