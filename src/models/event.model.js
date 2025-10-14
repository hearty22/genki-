import { sequelize } from "../database/database.js";
import { DataTypes } from "sequelize";

export const eventModel = sequelize.define("events", {
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
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    event_type: {
        type: DataTypes.ENUM('class', 'exam', 'meeting', 'holiday', 'workshop', 'other'),
        defaultValue: 'other'
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    is_public: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    color: {
        type: DataTypes.STRING(7),
        defaultValue: '#3F51B5'
    }
}, {
    timestamps: true
});
