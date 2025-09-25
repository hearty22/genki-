import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv"; configDotenv()
const SECRET = process.env.JWT_SEC;

export const authMiddleware = async (req, res, next) =>{
    const authHeader = req.cookies.token;
    if(!authHeader){return res.status(401).json({message:"no token"})}
    
    try {
        const decoded = jwt.verify(authHeader, SECRET);
        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({message:"token invalido"})
    }
}