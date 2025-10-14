// 1. Primero las relaciones de usuarios e instituciones (modelos base)
import { usersModel } from "./users.model.js";
import { instModel } from "./inst.model.js";
import { userInstitutionModel } from "./userInstitution.model.js";
import { careerModel } from "./career.model.js";
import { courseModel } from "./course.model.js";
import { subjectModel } from "./subject.model.js";
import { eventModel } from "./event.model.js";



usersModel.belongsToMany(instModel, {
    through: userInstitutionModel,
    foreignKey: "user_id",
    otherKey: "institution_id"
});

instModel.belongsToMany(usersModel, {
    through: userInstitutionModel,
    foreignKey: "institution_id",
    otherKey: "user_id"
});

// 2. Relaciones con instituciones
instModel.hasMany(careerModel, { 
    foreignKey: "inst_id",
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

careerModel.belongsTo(instModel, { 
    foreignKey: "inst_id",
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// 3. Relaciones con carreras
careerModel.hasMany(courseModel, { 
    foreignKey: "career_id",
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

courseModel.belongsTo(careerModel, { 
    foreignKey: "career_id",
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// 4. Relaciones con cursos
courseModel.hasMany(subjectModel, { 
    foreignKey: "course_id",
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

subjectModel.belongsTo(courseModel, { 
    foreignKey: "course_id",
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// 5. Relaciones con usuarios (profesores)
usersModel.hasMany(subjectModel, { 
    foreignKey: "teaching_user_id",
    as: 'taughtSubjects',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});

subjectModel.belongsTo(usersModel, { 
    foreignKey: "teaching_user_id",
    as: 'teacher',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});

// Exportar todo
export {
    usersModel,
    instModel,
    userInstitutionModel,
    careerModel,
    courseModel,
    subjectModel,
    eventModel
};
