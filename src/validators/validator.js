import { validationResult } from "express-validator";


export const validator = (req, res, next)=>{
    const result = validationResult(req);
    if(!result.isEmpty()){
        // Extraer los mensajes de error específicos
        const errors = result.mapped();
        const errorMessages = [];

        // Recorrer todos los errores y extraer los mensajes
        Object.keys(errors).forEach(field => {
            errorMessages.push(errors[field].msg);
        });

        return res.status(400).json({
            success: false,
            message: errorMessages.join('. '), // Unir todos los mensajes con punto
            errors: errors // También incluir el objeto completo de errores
        });
    }
    next();
};

