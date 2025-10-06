import { sequelize } from "../database/database.js";
import { DataTypes } from "sequelize";


export const userInstitutionModel = sequelize.define("user_institutions", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});
