import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { instModel } from "./inst.model.js";


export const careerModel =  sequelize.define("careers",{
    name:{
        type: DataTypes.STRING(200),
        allowNull: false
    },
    career_long:{
        type: DataTypes.INTEGER(5),
        allowNull: false
    }

});

