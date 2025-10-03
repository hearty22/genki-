import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { instModel } from "./inst.model.js";


export const careerModel = sequelize.define("courses",{
    name:{
        type: DataTypes.STRING(200),
        allowNull: false
    },
    career_long:{
        type: DataTypes.INTEGER(5),
        allowNull: false
    }

});

instModel.hasMany(careerModel, {foreignKey:"inst_id"});
careerModel.belongsTo(instModel, {foreignKey: "inst_id"});