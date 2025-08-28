import express from "express";
import { configDotenv } from "dotenv";
//importacion de la base de datos
import "./src/models/users.model.js";
import { db_conect } from "./src/database/db.js";
import userRouter from "./src/routes/user.routes.js";

configDotenv();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.static("public"))

app.use("/api", userRouter)

app.get("/", (req, res)=>{
    res.send("./public/index.hmtl");
});

app.get("/",(req, res)=>{})

app.listen(PORT, async ()=>{
    await db_conect()
    console.log(`servidor corriendo en http://localhost:${PORT}`);
});