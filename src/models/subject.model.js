import { sequelize } from "../database/database.js";
import { DataTypes } from "sequelize";



export const subjectModel =  sequelize.define("subjects", {
    name:{
        type: DataTypes.STRING(200),
        allowNull: false
    }
});
2