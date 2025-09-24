import { sequelize } from "../database/database.js";
import { DataTypes } from "sequelize";

export const userInstitutionModel = sequelize.define("user_institutions", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    institution_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'instituciones',
            key: 'id_institucion'
        }
    },
    role: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Rol del usuario en la institución (ej: estudiante, profesor, admin)'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'institution_id']
        }
    ]
});

// Relaciones
userInstitutionModel.associate = (models) => {
    userInstitutionModel.belongsTo(models.usersModel, {
        foreignKey: 'user_id'
    });
    userInstitutionModel.belongsTo(models.instModel, {
        foreignKey: 'institution_id'
    });
};
