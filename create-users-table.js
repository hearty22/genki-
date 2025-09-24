import { configDotenv } from 'dotenv';
import { Sequelize } from 'sequelize';
configDotenv();

console.log('🔧 Creando tabla users en MySQL...');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: true,
      ca: process.env.DB_CA_CERT
    } : false,
    logging: console.log
  }
);

async function createUsersTable() {
  try {
    // Crear la tabla users
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_name VARCHAR(200) NOT NULL,
        email VARCHAR(200) UNIQUE NOT NULL,
        password VARCHAR(200) NOT NULL,
        profile_photo_path VARCHAR(500) NULL,
        gender VARCHAR(255) NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tabla users creada exitosamente');

    // Verificar que la tabla existe
    const [results] = await sequelize.query("SHOW TABLES LIKE 'users'");
    if (results.length > 0) {
      console.log('✅ Tabla users verificada correctamente');

      // Mostrar estructura de la tabla
      const [structure] = await sequelize.query("DESCRIBE users");
      console.log('📋 Estructura de la tabla users:');
      console.table(structure);
    } else {
      console.log('❌ Error: La tabla users no se creó correctamente');
    }

  } catch (error) {
    console.log('❌ Error al crear la tabla:', error.message);
  } finally {
    await sequelize.close();
  }
}

createUsersTable();
