import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv"; configDotenv()
const SECRET = process.env.JWT_SEC;

export const authMiddleware = async (req, res, next) =>{
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies.token;

    let token;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (cookieToken) {
        token = cookieToken;
    }

    if(!token){return res.status(401).json({message:"no token"})}
    
    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({message:"token invalido"})
    }
}

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
};