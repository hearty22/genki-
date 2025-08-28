import { usersModel } from "../models/users.model.js";

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
        const newUser = new usersModel({user_name, email, password})
        newUser.save()
        return res.status(201).json({message:`usuario creado: ${newUser}`});

    } catch (error) {
        res.status(500).json({error: "error interno al crear el usuario"})
    }
}