import { configDotenv } from 'dotenv';
import { Sequelize } from 'sequelize';
configDotenv();

console.log('🔍 Verificando tabla users...');

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

async function verifyTable() {
  try {
    // Verificar que la tabla existe
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'users'");
    if (tables.length > 0) {
      console.log('✅ Tabla users existe');

      // Mostrar estructura de la tabla
      const [structure] = await sequelize.query("DESCRIBE users");
      console.log('📋 Estructura de la tabla:');
      structure.forEach(field => {
        console.log(`   ${field.Field}: ${field.Type} ${field.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${field.Key === 'PRI' ? 'PRIMARY KEY' : ''} ${field.Default ? `DEFAULT ${field.Default}` : ''}`);
      });

      // Verificar si hay datos
      const [count] = await sequelize.query("SELECT COUNT(*) as count FROM users");
      console.log(`📊 Registros en la tabla: ${count[0].count}`);

    } else {
      console.log('❌ Tabla users no existe');
      console.log('💡 Ejecuta: node create-users-table.js');
    }

  } catch (error) {
    console.log('❌ Error al verificar la tabla:', error.message);
  } finally {
    await sequelize.close();
  }
}

verifyTable();
