import { Router } from "express";
import UserManager from "../manager/userManager.js";
import BookingManager from "../manager/bookingManager.js";
import { createHash } from "../utils/hasheo.js"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"

const userManager = new UserManager();
const bookingManager = new BookingManager();

const userRouter = Router();

const jwtVerify = async (req, res, next) => {

    const token = req.signedCookies.authToken

    if (token === undefined) {
        return res.status(401).json({
            code: 401,
            message: "Autenticación fallida"
        })
    }

    jwt.verify(token, `${process.env.SECRET_KEY}`, function (err, success) {

        if (err) {
            return res.status(401).json({
                code: 401,
                message: "Token expirado o invalido"
            })
        }

        return next();

    });
}

const authAdmin = async (req, res, next) => {
    const adminId = req.params.adminId

    const user = await userManager.getUserById(adminId)

    if (!user) {
        return res.status(400).json({
            code: 400,
            message: "La autenticación falló"
        })
    }

    if (user.role !== "Admin") {
        return res.status(401).json({
            code: 401,
            message: "No estas autorizado"
        })
    }

    return next();
}

userRouter.get("/users", async (req, res) => {
    try {
        const users = await userManager.getUsers();

        res.status(200).json(users)
    } catch (e) {
        return res.status(500).json({
            code: 500,
            message: "Error al consultar los usuarios"
        })
    }
})

userRouter.get("/user/:uid", jwtVerify, async (req, res) => {
    try {

        const uid = req.params.uid
        const user = await userManager.getUserById(uid)
        if (!user) {
            return res.status(404).json({
                code: 404,
                message: "Usuario no encontrado"
            })
        }
        let body = {
            id: user.id,
            role: user.role,
            names: user.names,
            surnames: user.surnames,
            phone: user.phone,
            email: user.email
        }

        return res.status(200).json({
            code: 200,
            body: body
        })
    } catch (e) {
        return res.status(500).json({
            code: 500,
            message: "Error al consultar el usuario"
        })
    }
})

userRouter.post("/createUser", async (req, res) => {
    try {
        const { names, surnames, phone, email, password } = req.body

        if (names === "" || surnames === "" || phone === "" || email === "" || password === "") {
            let body = {}
            body.message = "Completa todos los campos"
            body.code = 401
            return res.status(401).json(body)
        }

        const newUser = {
            names: names,
            surnames: surnames,
            phone: phone,
            email: email,
            password: createHash(password)
        }

        //Envio correo de bienvenida:
        const transport = nodemailer.createTransport({
            host: process.env.PORT, //(para Gmail)
            service: "gmail", //(para Gmail)
            port: 587,
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        await transport.sendMail({
            from: process.env.USER_EMAIL,//Correo del emisor
            to: `${newUser.email}`,//Correo del receptor
            subject: "Maxi Barber Shop",//Asunto del correo
            html: `<div>
            <h1>¡Te damos la bienvenida a Maxi Barber Shop!</h1>
            <h3>¡Hola, ${newUser.names}!</h3>
            <p>Nos alegra mucho tenerte con nosotros, ahora podras reservar tu turno por este medio en Maxi Barber Shop, te esperamos pronto.</p>
            <hr/>
            <footer><h4>Att: team Maxi</h4></footer>
            </div>`
        })

        await userManager.createUser(newUser)

        res.status(201).json({
            code: 201,
            message: `Registro exitoso - ${names}`
        })
    } catch (e) {
        return res.status(500).json({
            code: 500,
            message: "Error al registrarse"
        })
    }
})

userRouter.put("/updateUser/:uid", async (req, res) => {
    try {
        const uid = req.params.uid
        const user = await userManager.getUserById(uid)
        if (!user) {
            return res.status(404).json({
                code: 404,
                message: "Usuario no encontrado"
            })
        }

        const { names, surnames, phone, email } = req.body

        const update = {
            names: names,
            surnames: surnames,
            phone: phone,
            email: email
        }

        await userManager.updateUser(uid, update)

        return res.status(200).json({
            code: 200,
            message: `Usuario modificado ${names}`
        })
    } catch (e) {
        return res.status(500).json({
            code: 500,
            message: "Error al editar el usuario"
        })
    }
})

userRouter.delete("/deleteUser/:uid", jwtVerify, async (req, res) => {
    try {
        const uid = req.params.uid
        const user = await userManager.getUserById(uid)
        if (!user) {
            return res.status(404).json({
                code: 404,
                message: "Usuario no encontrado"
            })
        }

        await userManager.deleteUser(uid)

        return res.status(200).json({
            code: 200,
            message: `Usuario '${user.names}' eliminado`
        })
    } catch (e) {
        return res.status(500).json({
            code: 500,
            message: "Error al eliminar el usuario"
        })
    }
})

//Enviar restablecimiento
userRouter.post("/restablecimientodecontrasena", async (req, res) => {
    try {
        const { email } = req.body

        if (email === "" || undefined) {
            return res.status(401).json({
                code: 401,
                message: "¡Completa el campo!"
            })
        }

        const users = await userManager.getUsers()
        const user = users.find(item => item.email === email)

        if (!user) {
            return res.status(404).json({
                code: 404,
                message: "¡El correo no esta registrado!"
            })
        }

        //Envio correo:
        const transport = nodemailer.createTransport({
            host: process.env.PORT, //(para Gmail)
            service: "gmail", //(para Gmail)
            port: 587,
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        await transport.sendMail({
            from: process.env.USER_EMAIL,//Correo del emisor
            to: `${user.email}`,//Correo del receptor
            subject: "Maxi Barber Shop",//Asunto del correo
            html: `<div>
            <h1>Recuperar la contraseña de tu cuenta Maxi Barber Shop:</h1>
            <h3>¡Hola, ${user.names}!</h3>
            <p>Solicitaste la recuperacion de contraseña de tu cuenta Maxi.</p>
            <p>Para restablecer tu contraseña da click <a href="${process.env.URL_FRONTEND}/restablecer/${user.id}">AQUI</a> y sigue con los pasos, gracias por preferirnos.</p>
            <hr/>
            <footer><h4>Att: team Maxi</h4></footer>
        </div>`
        })

        return res.status(200).json({
            code: 200,
            message: "Se envio un correo a la direccion ¡Verifica tu email!"
        })

    } catch (e) {
        return res.status(500).json({
            code: 500,
            message: "Error al restablecer la contraseña"
        })
    }
})

//Restablecer contraseña
userRouter.put("/restablecer/:uid", async (req, res) => {
    try{
        const uid = req.params.uid

        const user = await userManager.getUserById(uid)

        if(!user) {
            return res.status(404).json({
                code: 404,
                message: "No se encontró el usuario"
            })
        }

        const { newPass, confirmNewPass } = req.body

        if(newPass === "" || confirmNewPass === "") {
            return res.status(401).json({
                code: 401,
                message: "Completa todos los campos"
            })
        }

        if(newPass !== confirmNewPass) {
            return res.status(401).json({
                code: 401,
                message: "Las contraseñas no son iguales"
            })
        }

        const password = createHash(confirmNewPass)

        //Envio correo:
        const transport = nodemailer.createTransport({
            host: process.env.PORT, //(para Gmail)
            service: "gmail", //(para Gmail)
            port: 587,
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        await transport.sendMail({
            from: process.env.USER_EMAIL,//Correo del emisor
            to: `${user.email}`,//Correo del receptor
            subject: "Maxi Barber Shop",//Asunto del correo
            html: `<div>
            <h1>Contraseña restablecida:</h1>
            <h3>¡Hola, ${user.names}!</h3>
            <p>(Este es un correo informativo).</p>
            <p>Se restableció exitosamente la contraseña de tu cuenta Maxi, si no fuiste tú ponte en contacto con soporte, en caso contrario hacer caso omiso.</p>
            <hr/>
            <footer><h4>Att: team Maxi</h4></footer>
        </div>`
        })

        await userManager.updateUserPassword(uid, {password: password})

        return res.status(200).json({
            code: 200,
            message: "Se restableció exitosamente la contraseña"
        })

    }catch(e){
        return res.status(500).json({
            code: 500,
            message: "Error al restablecer la contraseña"
        })
    }
})

//Consultar reservas (Admin):
userRouter.get("/bookings/:adminId", authAdmin, async (req, res) => {
    try {
        const bookings = await userManager.adminGetBookings()

        return res.status(200).json(bookings)
    } catch (e) {
        return res.status(500).json({
            code: 500,
            message: "Error al consultar las reservas"
        })
    }
});

//Crear reserva:
userRouter.post("/createBooking/:uid", async (req, res) => {
    try {
        const uid = req.params.uid
        const { date, time, typeTime } = req.body

        const newBooking = {
            date: date,
            time: time,
            typeTime: typeTime,
            uid: uid
        }

        await bookingManager.createBooking(newBooking)

        return res.status(201).json({
            code: 201,
            message: `Reserva creada con éxito`
        })
    } catch (e) {
        return res.status(500).json({
            code: 500,
            message: "Error al crear la reserva, intenta de nuevo"
        })
    }
});

export default userRouter;