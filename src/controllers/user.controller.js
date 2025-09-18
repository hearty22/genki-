import { usersModel } from "../models/users.model.js";
import { configDotenv } from "dotenv";
import { generateToken, verifyToken } from "../helpers/jwt.helper.js";
import { comparePassword, hashPassword } from "../helpers/bcrypt.helper.js";
configDotenv()
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

        generateToken(user, res);

        res.status(200).json({user: {name: user.user_name, email:user.email}});

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "error interno al iniciar sesión"})
    }
}


export const getProfile = async (req, res)=>{
    try {
        const info = verifyToken(req)
        res.cookie("user", info,
            {
            httpOnly: false,
            secure: false, // solo por HTTPS
            sameSite: "strict",
            maxAge: 60 * 60 * 1000 // 1 hora
            }
        )
        return res.status(200);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "error interno en obtener la informacion del usuario"})
    }
};