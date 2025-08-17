import express from "express";
import { configDotenv } from "dotenv";
configDotenv();
const PORT_PUBLIC = process.env.PORT_PUBLIC;
const app = express();

app.use(express.static("public"))

app.get("/", (req, res)=>{
    res.send("./public/index.hmtl");
});

app.listen(PORT_PUBLIC, ()=>{
    console.log(`aplicacion web corriendo en http://localhost:${PORT_PUBLIC}`)
})