const { Sequelize, Model, DataTypes } = require("sequelize");
const db = require("../db");
class Propiedades extends Model {}

Propiedades.init(
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alquilar: {
      type: DataTypes.BOOLEAN,
    },
    vender: {
      type: DataTypes.BOOLEAN,
    },
    categoria: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ambientes: {
      type: DataTypes.INTEGER,
    },
    baños: {
      type: DataTypes.INTEGER,
    },
    metraje: {
      type: DataTypes.INTEGER,
    },
    dormitorios: {
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
    modelName: "propiedades",
  }
);

module.exports = Propiedades;
