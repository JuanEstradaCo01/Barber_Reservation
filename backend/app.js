import express from "express";
import userRouter from "./routers/userRouter.js";
import sessionRouter from "./routers/sessionRouter.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors({
    origin: `http://localhost:3000`, //Frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true 
}));
app.use(cookieParser(`${process.env.SECRET_KEY}`));

const PORT = process.env.PORT || 8080

//Levanto servidor:
app.listen(PORT, () => (console.log(`Server running on port ${PORT}`)))

app.get("/healtcheck", (req, res) => {
    return res.status(200).json({
        state: "Running",
        date: new Date().toLocaleString()
    })
})

app.use("/", userRouter)
app.use("/", sessionRouter)