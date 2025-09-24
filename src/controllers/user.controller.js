import fs from "fs";
import path from "path";
import multer from "multer";
import { usersModel } from "../models/users.model.js";
import { generateToken, verifyToken } from "../helpers/jwt.helper.js";
import { comparePassword, hashPassword } from "../helpers/bcrypt.helper.js";
export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb() es un "callback" que indica a Multer dónde guardar el archivo
    cb(null, 'uploads/profiles'); // La carpeta donde se guardarán las fotos
  },
  filename: function (req, file, cb) {
    // Crea un nombre de archivo único para evitar conflictos
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
        if(!user_name){return res.status(400).json({message:"campo no rellenado: user_name"})}
        if(!email){return res.status(400).json({message:"campo no rellenado: email"})}
        if(!password){return res.status(400).json({message:"campo no rellenado: password"})}
        if(!gender){return res.status(400).json({message:"campo no rellenado: genero"})}

        const emailexist = await usersModel.findOne({where: {email}})
        if(emailexist){return res.status(400).json({message:"el email ingresado ya esta asociado "})};

        const hashpassword = await hashPassword(password);
        
        const newUser = new usersModel({user_name, email, password: hashpassword, gender})
        newUser.save()
        res.status(201).json({message:`usuario creado: ${newUser}`});
    
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "error interno al crear el usuario"});
        
    }
}


export const loginUser = async (req, res)=>{
    try {
        const {email, password} = req.body
        if(!email){ return res.status(400).json({message:"campo no rellenado: email"})}
        if(!password){ return res.status(400).json({message: "campo no rellenado: contraseña"})}
        
        const user = await usersModel.findOne({
            where:{
                email:email
            }})
        if(!user){return res.status(400).json({message:"credenciales invalidas"})}

        const passMatch = await comparePassword(password, user.password)
        if(!passMatch){return res.status(401).json({message: "credenciales invalidas"})}
        generateToken(user, res);

        res.status(200).json({user: {name: user.user_name, email:user.email}});

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "error interno al iniciar sesión"})
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
// endpoint para subir la foto de perfil
export const Profile = async (req, res)=>{
    try {
        const token = verifyToken(req);
        const userId = token.id;

        // Verificar si se subió un archivo
        if (!req.file) {
            return res.status(400).json({error: "No se ha seleccionado ningún archivo"});
        }

        // Obtener la ruta relativa del archivo
        const profilePhotoPath = req.file.path;

        // Actualizar el usuario con la nueva foto de perfil
        const updatedUser = await usersModel.update(
            { profile_photo_path: profilePhotoPath },
            { where: { id: userId } }
        );

        if (updatedUser[0] === 0) {
            return res.status(404).json({error: "Usuario no encontrado"});
        }

        res.status(200).json({
            message: "Foto de perfil actualizada exitosamente",
            profilePhotoPath: profilePhotoPath,
            filename: req.file.filename
        });

    } catch (error) {
        console.log(error);
        if (error.message === 'Solo se permiten archivos de imagen') {
            return res.status(400).json({error: error.message});
        }
        if (error.message === "error en validar el token") {
            return res.status(401).json({error: "Token inválido o expirado"});
        }
        return res.status(500).json({error: "Error interno del servidor"});
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
