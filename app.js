import express from "express";
import "dotenv/config";

//importacion de la base de datos
import "./src/models/index.model.js"
import { db_conect } from "./src/database/db.js";
import userRouter from "./src/routes/user.routes.js";
import cookieParser from "cookie-parser";


const app = express();
const PORT = process.env.PORT;


app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api", userRouter)

app.get("/", (req, res)=>{
    res.send("./public/index.hmtl");
});



app.listen(PORT, async ()=>{
    await db_conect()
    console.log(`servidor corriendo en http://localhost:${PORT}`);
});