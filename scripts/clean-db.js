import mysql from 'mysql2/promise';
import fs from 'fs';
import 'dotenv/config';

async function cleanDatabase() {
    let connection;

    try {
        console.log('🗑️ Limpiando base de datos Aiven...');

        // Crear conexión con SSL
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            ssl: {
                ca: process.env.DB_CA_CERT,
                rejectUnauthorized: true
            }
        });

        // Obtener todas las tablas
        const [tables] = await connection.execute("SHOW TABLES");
        console.log('📋 Tablas encontradas:', tables.map(t => Object.values(t)[0]));

        // Desactivar foreign key checks
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

        // Eliminar registros de cada tabla
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            const [results] = await connection.execute(`DELETE FROM \`${tableName}\``);
            console.log(`✅ ${results.affectedRows || 0} registros eliminados de ${tableName}`);
        }

        // Reactivar foreign key checks
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

        // Reiniciar auto-increment
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            await connection.execute(`ALTER TABLE \`${tableName}\` AUTO_INCREMENT = 1`);
            console.log(`🔄 Auto-increment reiniciado para ${tableName}`);
        }

        console.log('🎉 ¡Base de datos limpiada completamente!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

cleanDatabase();
