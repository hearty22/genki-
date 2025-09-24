import { usersModel } from "./users.model.js";
import { instModel } from "./inst.model.js";
import { userInstitutionModel } from "./userInstitution.model.js";
import { setupAssociations } from "./associations.js";

// Configurar todas las asociaciones
setupAssociations();

// Exportar modelos para que puedan ser utilizados en otros archivos
export { usersModel, instModel, userInstitutionModel };