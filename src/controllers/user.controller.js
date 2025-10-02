/**
 * Controlador de usuarios - Versión corregida
 */

import fs from "fs";
import path from "path";
import multer from "multer";
import { usersModel } from "../models/users.model.js";
import { instModel } from "../models/inst.model.js";
import { generateToken, verifyToken } from "../helpers/jwt.helper.js";
import { comparePassword, hashPassword } from "../helpers/bcrypt.helper.js";

// Configuración de multer para subir fotos de perfil
export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Crear la carpeta si no existe
    const uploadDir = 'uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Crear un nombre de archivo único para evitar conflictos
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    },
    fileFilter: function (req, file, cb) {
        // Verificar que sea una imagen
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    }
});

//register
export const createUser = async (req, res)=>{
    try {
        const {user_name, email, password, gender}  = req.body
        const hashpassword = await hashPassword(password);

        const newUser = new usersModel({user_name, email, password: hashpassword, gender})
        await newUser.save()

        res.status(201).json({
            success: true,
            message: `Usuario creado exitosamente`,
            user: {
                id: newUser.id,
                user_name: newUser.user_name,
                email: newUser.email,
                gender: newUser.gender
            }
        });

    } catch (error) {
        console.log(error);

        // Si es un error de validación de express-validator
        if (error.errors) {
            return res.status(400).json({
                message: "Errores de validación",
                errors: error.errors
            });
        }

        res.status(500).json({error: "Error interno al crear el usuario"});
    }
}


export const loginUser = async (req, res)=>{
    try {
        const {email, password} = req.body

        // Las validaciones básicas ya se manejaron en el middleware
        const user = await usersModel.findOne({
            where:{
                email:email
            }})
        if(!user){return res.status(400).json({
            success: false,
            message: "Credenciales inválidas"
        })}

        const passMatch = await comparePassword(password, user.password)
        if(!passMatch){return res.status(401).json({
            success: false,
            message: "Credenciales inválidas"
        })}

        generateToken(user, res);

        res.status(200).json({
            success: true,
            message: "Login exitoso",
            user: {
                id: user.id,
                name: user.user_name,
                email: user.email
            }
        });

    } catch (error) {
        console.log(error);

        // Si es un error de validación de express-validator
        if (error.errors) {
            return res.status(400).json({
                message: "Errores de validación",
                errors: error.errors
            });
        }

        res.status(500).json({error: "Error interno al iniciar sesión"})
    }
}


export const getProfile = async (req, res)=>{
    try {
        const token = verifyToken(req);
        const userId = token.id;

        // Buscar al usuario en la base de datos
        const user = await usersModel.findOne({
            where: { id: userId },
            attributes: ['id', 'user_name', 'email', 'gender', 'profile_photo_path', 'createdAt']
        });

        if (!user) {
            return res.status(404).json({error: "Usuario no encontrado"});
        }

        res.status(200).json({
            message: "Perfil obtenido exitosamente",
            user: {
                id: user.id,
                user_name: user.user_name,
                email: user.email,
                gender: user.gender,
                profile_photo_path: user.profile_photo_path,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.log(error);
        if (error.message === "error en validar el token") {
            return res.status(401).json({error: "Token inválido o expirado"});
        }
        return res.status(500).json({error: "Error interno del servidor"});
    }
};

// endpoint para subir la foto de perfil - CORREGIDO
export const Profile = async (req, res)=>{
    try {
        const token = verifyToken(req);
        const userId = token.id;

        // Verificar si se subió un archivo
        if (!req.file) {
            return res.status(400).json({error: "No se ha seleccionado ningún archivo"});
        }

        // Obtener la ruta relativa del archivo (compatible con el frontend)
        const profilePhotoPath = req.file.path.replace(/\\/g, '/'); // Normalizar path para web

        console.log("📸 Subiendo foto de perfil para usuario:", userId);
        console.log("📁 Archivo:", req.file.filename);
        console.log("🛤️ Path:", profilePhotoPath);

        // Actualizar el usuario con la nueva foto de perfil
        const [updatedRows] = await usersModel.update(
            { profile_photo_path: profilePhotoPath },
            { where: { id: userId } }
        );

        if (updatedRows === 0) {
            return res.status(404).json({error: "Usuario no encontrado"});
        }

        console.log("✅ Foto de perfil actualizada exitosamente");

        res.status(200).json({
            message: "Foto de perfil actualizada exitosamente",
            profilePhotoPath: profilePhotoPath,
            filename: req.file.filename
        });

    } catch (error) {
        console.log("❌ Error en Profile:", error);
        if (error.message === 'Solo se permiten archivos de imagen') {
            return res.status(400).json({error: error.message});
        }
        if (error.message === "error en validar el token") {
            return res.status(401).json({error: "Token inválido o expirado"});
        }
        return res.status(500).json({error: "Error interno del servidor", details: error.message});
    }
};

export const deleteProfilePhoto = async (req, res)=>{
    try {
        const token = verifyToken(req);
        const userId = token.id;

        // Buscar al usuario para obtener la ruta de la foto actual
        const user = await usersModel.findOne({
            where: { id: userId },
            attributes: ['profile_photo_path']
        });

        if (!user) {
            return res.status(404).json({error: "Usuario no encontrado"});
        }

        // Si el usuario tiene una foto de perfil, eliminarla del sistema de archivos
        if (user.profile_photo_path) {
            const fullPath = path.join(process.cwd(), user.profile_photo_path);

            // Verificar si el archivo existe antes de intentar eliminarlo
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }

        // Actualizar la base de datos para eliminar la referencia a la foto
        await usersModel.update(
            { profile_photo_path: null },
            { where: { id: userId } }
        );

        res.status(200).json({
            message: "Foto de perfil eliminada exitosamente"
        });

    } catch (error) {
        console.log(error);
        if (error.message === "error en validar el token") {
            return res.status(401).json({error: "Token inválido o expirado"});
        }
        return res.status(500).json({error: "Error interno del servidor"});
    }
};

// Obtener instituciones del usuario
export const getUserInstitutions = async (req, res) => {
    try {


        // Buscar las instituciones del usuario
        const institutions = await instModel.findAll({
            where: {
                is_active: true
            },
            attributes: ['id', 'name', 'siglas', 'logo', 'address', 'nivel', 'createdAt'],
            order: [['name', 'ASC']]
        });

        res.status(200).json({
            message: "Instituciones del usuario obtenidas exitosamente",
            institutions: institutions
        });

    } catch (error) {
        console.log(error);
        if (error.message === "error en validar el token") {
            return res.status(401).json({error: "Token inválido o expirado"});
        }
        return res.status(500).json({error: "Error interno del servidor"});
    }
};

// Asignar institución a usuario - YA NO ES NECESARIO
export const assignInstitutionToUser = async (req, res) => {
    return res.status(400).json({
        message: "Esta funcionalidad ya no está disponible. Las instituciones pertenecen directamente a los usuarios que las crean."
    });
};

// Remover institución de usuario - YA NO ES NECESARIO
export const removeInstitutionFromUser = async (req, res) => {
    return res.status(400).json({
        message: "Esta funcionalidad ya no está disponible. Las instituciones pertenecen directamente a los usuarios que las crean."
    });
};

// ✅ Endpoint de prueba para verificar el modelo
export const testInstitutions = async (req, res) => {
    try {
        console.log("🧪 Probando modelo instModel...");

        // Verificar si el modelo existe
        console.log("instModel:", instModel);
        console.log("instModel name:", instModel.name);

        // Intentar una consulta simple
        const count = await instModel.count();
        console.log("Total de instituciones en BD:", count);

        // Obtener una institución
        const firstInst = await instModel.findOne();
        console.log("Primera institución:", firstInst);

        res.status(200).json({
            message: "Test exitoso",
            modelName: instModel.name,
            totalCount: count,
            firstInstitution: firstInst
        });

    } catch (error) {
        console.log("❌ Error en testInstitutions:", error);
        console.log("❌ Error stack:", error.stack);
        return res.status(500).json({
            error: "Error en test",
            details: error.message,
            stack: error.stack
        });
    }
};
