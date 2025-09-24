import { Sequelize } from "sequelize";
import { configDotenv } from "dotenv";
configDotenv();

export const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        port: process.env.DB_PORT || 3306,
        host: process.env.DB_HOST || 'localhost',
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        ssl: process.env.DB_SSL === 'true' || process.env.DB_HOST?.includes('aivencloud.com') ? {
            require: true,
            rejectUnauthorized: true,
            ca: process.env.DB_CA_CERT
        } : false,
        dialectOptions: process.env.DB_HOST?.includes('aivencloud.com') ? {
            ssl: {
                require: true,
                rejectUnauthorized: true,
                ca: process.env.DB_CA_CERT
            }
        } : {}
    }
)