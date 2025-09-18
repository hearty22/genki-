import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

export const generateToken = (user , res)=>{
    try {
        const payload = ({
            id: user.id,
            user_name: user.user_name ,
            
        })

        const token = jwt.sign(payload, process.env.JWT, {expiresIn:"1h"});

         res.cookie("token", token , {
            httpOnly: true,
            secure: false, // solo por HTTPS
            sameSite: "strict",
            maxAge: 60 * 60 * 1000 // 1 hora
        });
    } catch (error) {
        console.log(error);
        throw new Error("error en generar el token");
        
    }
};
export const verifyToken = (req) => {
    try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT)
        return decoded;
    } catch (error) {
        throw new Error("error en validar el token");
        
    }
}