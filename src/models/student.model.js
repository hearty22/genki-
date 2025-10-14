import { sequelize } from "../database/database.js";
import { DataTypes } from "sequelize";

export const studentModel = sequelize.define("students", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    inst_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'instituciones',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    career_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'careers',
            key: 'id'
        }
    },
    enrollment_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    graduation_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'graduated', 'suspended'),
        defaultValue: 'active'
    },
    semester: {
        type: DataTypes.INTEGER(2),
        allowNull: true,
        defaultValue: 1
    }
}, {
    timestamps: true
});
