import { Router } from "express";
import jwt from "jsonwebtoken";
import UserManager from "../manager/userManager.js";
import { isValidPassword } from "../utils/hasheo.js"

const userManager = new UserManager();

const sessionRouter = Router();

function generateToken(uidObject) {
    return jwt.sign(uidObject, process.env.SECRET_KEY, { expiresIn: "24h" })
}

sessionRouter.post("/signIn", async (req, res) => {
    try {

        let body = {}

        let { user, password } = req.body

        if (user === "" || password === "") {
            let body = {}
            body.message = "Completa todos los campos"
            body.code = 401
            return res.status(401).json(body)
        }

        const users = await userManager.getUsers();

        const finduser = users.find(item => item.email === user)

        //Valido si existe el correo en la DB:
        if (!finduser) {
            let body = {}
            body.code = 404
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
            body.code = 401
            body.message = "Contraseña incorrecta"
            return res.status(401).json(body)
        }

        body.code = 200
        body.uid = userTool.id

        const uidObject = {
            uid: userTool.id
        }

        const accessToken = generateToken(uidObject)
        body.token = accessToken
        body.message = "Usuario autenticado correctamente"
        console.log("✅ Iniciaste sesion")

        return res.cookie("authToken", `${accessToken}`, {
            sameSite: 'Strict',
            signed: true,
            maxAge: 3600000, //1 hora
            domain: 'localhost', //Solo el dominio
            path: '/',
            httpOnly: false,
            secure: false //Cuando la peticion sea en https se cambia a true
        }).json(body)

    } catch (e) {
        return res.status(500).json({
            error: "Ocurrio un error al iniciar sesion", e
        })
    }
})

sessionRouter.post("/logout", (req, res) => {
    try {
        const token = req.signedCookies.authToken

        if (token === undefined) {
            return res.status(404).json({
                code: 404,
                message: "Operacion invalida, no existe una sesion activa"
            })
        }

        console.log("⛔ Sesion cerrada")

        return res.clearCookie("authToken").json({
            code: 200,
            message: "Sesion cerrada"
        })
    } catch (e) {
        return res.status(500).json({
            code: 500,
            message: "Ocurrio un error al cerrar sesion", e
        })
    }
})

export default sessionRouter;