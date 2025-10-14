import { sequelize } from "../database/database.js";
import { DataTypes } from "sequelize";


export const userInstitutionModel = sequelize.define("user_institutions", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    institution_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'instituciones',
            key: 'id'
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});
