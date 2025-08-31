import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv"; configDotenv()
const SECRET = process.env.JWT;

export const authMiddleware = async (req, res, next) =>{
    const authHeader = req.headers.authorization;
    if(!authHeader){return res.status(401).json({message:"no token"})}
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({message:"token invalido"})
    }
}