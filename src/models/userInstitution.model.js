import { sequelize } from "../database/database.js";
import { DataTypes } from "sequelize";
import { usersModel } from "./users.model.js";
import { instModel } from "./inst.model.js";

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


usersModel.belongsToMany(instModel,{
    through:"user_institutions",
    foreignKey: "inst_id",
    otherKey:"user_id"
});
instModel.belongsToMany(usersModel,{
    through:"user_institutions",
    foreignKey: "user_id",
    otherKey:"inst_id"
});

userInstitutionModel.belongsTo(usersModel,{foreignKey: "user_id"});
userInstitutionModel.belongsTo(instModel,{foreignKey: "inst_id"});