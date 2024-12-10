import { Router } from "express";
import jwt from "jsonwebtoken";
import UserManager from "../manager/userManager.js";
import { isValidPassword } from "../utils/hasheo.js"

const userManager = new UserManager();

const sessionRouter = Router();

function generateToken(uidObject) {
    return jwt.sign(uidObject, process.env.SECRET_KEY, { expiresIn: "24h" })
}

//Iniciar sesion
sessionRouter.post("/signIn", async (req, res) => {
    try {

        let body = {}

        let { user, password } = req.body

        if (user === "" || password === "") {
            let body = {}
            body.message = "Completa todos los campos"
            return res.status(401).json(body)
        }

        const users = await userManager.getUsers();

        const finduser = users.find(item => item.email === user)

        //Valido si existe el correo en la DB:
        if (!finduser) {
            let body = {}
            body.message = "Usuario no registrado"
            return res.status(404).json(body)
        }

        const userTool = {
            id: finduser.id,
            password: finduser.password
        }

        //Valido si la contraseña es correcta:
        if (!isValidPassword(password, userTool.password)) {
            let body = {}
            body.message = "Contraseña incorrecta"
            return res.status(401).json(body)
        }

        body.uid = userTool.id

        const uidObject = {
            uid: userTool.id
        }

        const accessToken = generateToken(uidObject)
        body.token = accessToken
        body.message = "Usuario autenticado correctamente"
        console.log("✅ Iniciaste sesion")

        return res.status(200).cookie("authToken", `${accessToken}`, {
            domain: `${process.env.BACKEND_DOMAIN}`, //Dominio
            path: '/',
            httpOnly: true,
            secure: true, //Cuando la peticion sea en https se cambia a true
            sameSite: "none"
        }).json(body)

    } catch (e) {
        return res.status(500).json({
            message: "Ocurrio un error al iniciar sesion", e
        })
    }
})

//Cerrar sesion
sessionRouter.post("/logout", (req, res) => {
    try {
        const JWT = req.headers.cookie
        const [authToken, value] = JWT.split('=');
        const token = value

        if (token === undefined) {
            return res.status(404).json({
                message: "Operacion invalida, no existe una sesion activa"
            })
        }

        console.log("⛔ Sesion cerrada")

        return res.status(200).clearCookie("authToken").json({
            message: "Sesion cerrada"
        })
    } catch (e) {
        return res.status(500).json({
            message: "Ocurrio un error al cerrar sesion", e
        })
    }
})

export default sessionRouter;