import bcrypt from 'bcryptjs';

// Middleware para hashear contraseñas
export const hashPassword = async (req, res, next) => {
  try {
    if (req.body.password) {
      // Generar salt y hashear la contraseña
      const salt = await bcrypt.genSalt(12);
      req.body.hashedPassword = await bcrypt.hash(req.body.password, salt);
      
      // Eliminar la contraseña en texto plano del body
      delete req.body.password;
    }
    
    next();
  } catch (error) {
    console.error('Error al hashear contraseña:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al procesar la contraseña'
    });
  }
};

// Función utilitaria para comparar contraseñas
export const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error al comparar contraseñas:', error);
    throw new Error('Error al verificar contraseña');
  }
};

// Función utilitaria para hashear contraseña directamente
export const hashPasswordDirect = async (password) => {
  try {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Error al hashear contraseña:', error);
    throw new Error('Error al hashear contraseña');
  }
};