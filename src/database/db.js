
import { sequelize } from "./database.js";

export const db_conect = async ()=>{
    try {
        // await sequelize.sync({force: true});
        console.log("servidor conectado con la base de datos");
    } catch (error) {
        console.log("conexion fallida con la base de datos");
        console.log("------------------------------------------");
        console.error(error);
    }
};
