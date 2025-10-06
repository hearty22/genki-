import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

export const courseModel =  sequelize.define("courses",{
    year:{
        type: DataTypes.INTEGER(10),
        allowNull: false
    },
    description:{
        type: DataTypes.STRING(200),
        allowNull: false
    }
});

