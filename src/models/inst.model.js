import { sequelize } from "../database/database.js";
import { DataTypes } from "sequelize";
export const instModel = sequelize.define("instituciones",{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // user_id: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    //     references: {
    //         model: 'users',
    //         key: 'id'
    //     }
    // },
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
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});
