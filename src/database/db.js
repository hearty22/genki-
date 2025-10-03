
import { sequelize } from "./database.js";

const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 2000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const db_conect = async (retryCount = 0) => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({force: true});
        console.log("✅ Servidor conectado exitosamente con la base de datos");

        // await sequelize.sync({ force: false });

    } catch (error) {
        console.log("❌ Error de conexión con la base de datos:");
        console.log("------------------------------------------");
        console.error(`Tipo de error: ${error.name}`);
        console.error(`Mensaje: ${error.message}`);

        // Manejo específico de diferentes tipos de errores
        if (error.message.includes('SSL') || error.message.includes('certificate')) {
            console.log("🔒 Error de SSL/TLS - Problema con el certificado");
            console.log("   - Aiven MySQL requiere certificado CA para SSL");
            console.log("   - Verifica que DB_SSL=true en tu .env");
            console.log("   - Asegúrate de que DB_CA_CERT esté configurado");
            console.log("   - El hostname debe incluir 'aivencloud.com'");
        } else if (error.message.includes('invalid response')) {
            console.log("🔒 Este error sugiere un problema de SSL/TLS");
            console.log("   - Aiven requiere SSL para conexiones");
            console.log("   - Verifica que DB_SSL=true en tu .env");
            console.log("   - El hostname debe incluir 'aivencloud.com'");
        } else if (error.message.includes('ENOTFOUND')) {
            console.log("🌐 Error de DNS - hostname no encontrado");
            console.log("   - Verifica que el DB_HOST sea correcto");
            console.log("   - Asegúrate de tener conexión a internet");
        } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
            console.log("⏰ Error de timeout de conexión");
            console.log("   - El servidor puede estar sobrecargado");
            console.log("   - Verifica el puerto y firewall");
        } else if (error.message.includes('authentication failed') || error.message.includes('password')) {
            console.log("🔐 Error de autenticación");
            console.log("   - Verifica DB_USER y DB_PASS");
            console.log("   - Asegúrate de que las credenciales sean correctas");
        } else if (error.message.includes('does not exist')) {
            console.log("🗄️ Error de base de datos");
            console.log("   - Verifica que DB_NAME sea correcto");
            console.log("   - Asegúrate de que la base de datos exista");
        }

        // Si es un error de conexión y tenemos reintentos disponibles
        if ((error.name === 'SequelizeConnectionError' ||
             error.name === 'SequelizeHostNotFoundError' ||
             error.message.includes('SSL') ||
             error.message.includes('certificate') ||
             error.message.includes('invalid response')) &&
            retryCount < MAX_RETRY_ATTEMPTS) {

            console.log(`🔄 Reintentando conexión... (Intento ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
            console.log(`⏳ Esperando ${RETRY_DELAY_MS/1000} segundos...`);

            await sleep(RETRY_DELAY_MS);
            return db_conect(retryCount + 1);
        }

        console.log("💡 Sugerencias generales:");
        console.log("1. Verifica que tu servicio Aiven esté activo en el dashboard");
        console.log("2. Comprueba todas las credenciales en tu archivo .env");
        console.log("3. Asegúrate de que el hostname y puerto sean correctos");
        console.log("4. Verifica tu conexión a internet");
        console.log("5. Para Aiven MySQL: usa puerto 27972, SSL=true y certificado CA");
        console.log("------------------------------------------");

        throw error;
    }
};
