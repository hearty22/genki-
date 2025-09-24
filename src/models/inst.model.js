import { sequelize } from "../database/database.js";
import { DataTypes } from "sequelize";
export const instModel = sequelize.define("instituciones",{
    id_institucion:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    siglas: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    logo: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    notas: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    address: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    nivel: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    timestamps: true
});