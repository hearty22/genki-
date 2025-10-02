import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";


export const courseModel = sequelize.define("courses",{
    name:{
        type: DataTypes.STRING(200),
        allowNull: false
    }
})