import { sequelize } from "../database/database.js";
import { DataTypes } from "sequelize";
export const instModel = sequelize.define("instituciones",{
    id_institucion:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        
    },
    name:{},
    siglas:{},
    logo:{},
    notas:{}
})