import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conexión a MongoDB establecida correctamente.');
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error);
    process.exit(1);
  }
};

// Eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error de conexión MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose desconectado de MongoDB');
});

// Cerrar conexión cuando la aplicación se cierre
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔒 Conexión MongoDB cerrada debido a terminación de la aplicación');
  process.exit(0);
});

export default connectDB;