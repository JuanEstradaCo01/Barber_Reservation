import express from "express";
import userRouter from "./routers/userRouter.js";
import sessionRouter from "./routers/sessionRouter.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors({
    origin: `${process.env.FRONTEND_DOMAIN}`, //Frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//Rutas
app.use("/", userRouter)
app.use("/", sessionRouter)

const PORT = process.env.PORT || 8080

//Levanto servidor:
app.listen(PORT, () => (console.log(`Server running on port ${PORT}`)))

app.get("/healtcheck", (req, res) => {
    return res.status(200).json({
        state: "Running",
        date: new Date().toLocaleString()
    })
})