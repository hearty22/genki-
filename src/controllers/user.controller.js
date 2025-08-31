import { usersModel } from "../models/users.model.js";
import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
configDotenv()
const SECRET = "hola";

export const getUsers = async (req,res)=>{
    try {
        const users = await usersModel.findAll()
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({error:"error interno al obtener a los usuarios"})
    }
}

export const createUser = async (req, res)=>{
    try {
        const {user_name, email, password}  = req.body
        if(!user_name){return res.status(400).json({message:"campo no rellenado: user_name"})}
        if(!email){return res.status(400).json({message:"campo no rellenado: email"})}
        if(!password){return res.status(400).json({message:"campo no rellenado: password"})}
        const emailexist = await usersModel.findOne({where: {email}})
        if(emailexist){return res.status(400).json({message:"el email ingresado ya esta asociado "})};

        const newUser = new usersModel({user_name, email, password})
        newUser.save()
        res.status(201).json({message:`usuario creado: ${newUser}`});
    
    } catch (error) {
        res.status(500).json({error: "error interno al crear el usuario"});
        
    }
}

export const loginUser = async (req, res)=>{
    try {
        const {email, password, gender} = req.body
        if(!email){return res.status(400).json({message:"campo no rellenado: email"})}
        if(!password){return res.status(400).json({message: "campo no rellenado: contraseña"})}
        if(!gender){return res.status(400).json({message:"campo no rellenado: genero"})}
        
        const user = await usersModel.findOne({
            where:{
                email:email,
                password:password
            }})
        if(!user){return res.status(400).json({message:"credenciales invalidas"})}
        user.update({
            gender: gender
        })
        // console.log(SECRET);
        const token = jwt.sign({
            id: user.id,
            user_name: user.user_name,
            email: user.email,
            gender: user.gender
        }, SECRET, {expiresIn: "3d"})

        res.status(200).json({token, user: {name: user.user_name, email:user.email}});

    } catch (error) {
        res.status(500).json({error: "error interno al iniciar sesión"})
    }
}
export const uploadProfile = async (req, res)=>{
    try {
        const userId = req.user.id
        const imagePath = req.file ? req.file.filename : "pfp-default.webp"

        await usersModel.update(
            {profile_photo: imagePath },
            {where: {id: userId}}
        );

        res.json({message: "perfil actualizado"})
    } catch (error) {
        res.status(500).json({error: "error al guardar la foto"})
    }
} 

