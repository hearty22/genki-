import express from "express";
import "dotenv/config";
import path from "path";
import "./src/models/index.model.js"
//importacion de la base de datos
import { db_conect } from "./src/database/db.js";
import userRouter from "./src/routes/user.routes.js";
import instRouter from "./src/routes/inst.routes.js";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const PORT = process.env.PORT;


app.use(express.json());
app.use(express.static(path.join( __dirname ,"public")));
app.use(cookieParser());
//-----------------------------------------------------------
app.use('/uploads', express.static(path.join( __dirname ,'uploads')));

app.use("/api", userRouter)
app.use("/api", instRouter)

app.get("/", (req, res)=>{
    res.send("./public/index.hmtl");
});



app.listen(PORT, async ()=>{
    await db_conect()
    console.log(`servidor corriendo en http://localhost:${PORT}`);
});