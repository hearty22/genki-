import { sequelize } from "../database/database.js";
import { DataTypes } from "sequelize";

export const usersModel =  sequelize.define("users",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_name:{
        type: DataTypes.STRING(200),
        allowNull: false
    },
    email:{
        type:DataTypes.STRING(200),
        unique: true,
        allowNull: false
    },
    password:{
        type: DataTypes.STRING(200),
        allowNull: false
    }
},{timestamps:false});