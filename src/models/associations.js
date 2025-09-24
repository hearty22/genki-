import { usersModel } from "./users.model.js";
import { instModel } from "./inst.model.js";
import { userInstitutionModel } from "./userInstitution.model.js";

// Configurar todas las asociaciones
export const setupAssociations = () => {
    // Asociación entre users y user_institutions
    usersModel.hasMany(userInstitutionModel, {
        foreignKey: 'user_id',
        as: 'userInstitutions'
    });

    // Asociación entre user_institutions y users
    userInstitutionModel.belongsTo(usersModel, {
        foreignKey: 'user_id',
        as: 'user'
    });

    // Asociación entre instituciones y user_institutions
    instModel.hasMany(userInstitutionModel, {
        foreignKey: 'institution_id',
        as: 'userInstitutions'
    });

    // Asociación entre user_institutions e instituciones
    userInstitutionModel.belongsTo(instModel, {
        foreignKey: 'institution_id',
        as: 'institution'
    });

    // Asociación many-to-many entre users e instituciones
    usersModel.belongsToMany(instModel, {
        through: userInstitutionModel,
        foreignKey: 'user_id',
        otherKey: 'institution_id',
        as: 'institutions'
    });

    // Asociación many-to-many entre instituciones y users
    instModel.belongsToMany(usersModel, {
        through: userInstitutionModel,
        foreignKey: 'institution_id',
        otherKey: 'user_id',
        as: 'users'
    });

    console.log("✅ Asociaciones configuradas correctamente");
};
