import { usersModel } from "./users.model.js";
import { instModel } from "./inst.model.js";

// Configurar todas las asociaciones
export const setupAssociations = () => {
    // Asociación entre users e instituciones
    usersModel.hasMany(instModel, {
        foreignKey: 'user_id',
        as: 'institutions'
    });

    // Asociación entre instituciones y users
    instModel.belongsTo(usersModel, {
        foreignKey: 'user_id',
        as: 'owner'
    });

    console.log("✅ Asociaciones configuradas correctamente");
};
