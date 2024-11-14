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
            message: "Autenticación fallida"
        })
    }

    jwt.verify(token, `${process.env.SECRET_KEY}`, function (err, success) {

        if (err) {
            return res.status(401).json({
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
            message: "La autenticación falló"
        })
    }

    if (user.role !== "Admin") {
        return res.status(401).json({
            message: "No estas autorizado"
        })
    }

    return next();
}

const sendMail = async (html, email) => {
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
        to: `${email}`,//Correo del receptor
        subject: "Maxi Barber Shop",//Asunto del correo
        html: html
    })
}

userRouter.get("/usuario/:uid", jwtVerify, async (req, res) => {
    try {
        const uid = req.params.uid

        const reserve = await userManager.userGetBookingById(uid)
        if (!reserve) {
            return res.status(401).json({
                message: "El usuario no existe"
            })
        }

        const body = {
            id: reserve.id,
            role: reserve.role,
            names: reserve.names,
            surnames: reserve.surnames,
            phone: reserve.phone,
            email: reserve.email,
            Booking: reserve.Booking
        }

        //Devuelvo el usuario si no tiene reserva
        if (!reserve) {
            return res.status(404).json({
                body
            })
        }

        return res.status(200).json({
            body
        })

    } catch (e) {
        return res.status(500).json({
            message: "Error al consultar la reserva"
        })
    }
})

userRouter.post("/registro", async (req, res) => {
    try {
        const { names, surnames, phone, email, password } = req.body

        if (names === "" || surnames === "" || phone === "" || email === "" || password === "") {
            let body = {}
            body.message = "Completa todos los campos"
            return res.status(401).json(body)
        }

        const findUserIfExist = await userManager.getUserByEmail(email)
        if (findUserIfExist) {
            return res.status(401).json({
                message: "Ya existe un usuario registrado con este correo"
            })
        }

        const newUser = {
            names: names,
            surnames: surnames,
            phone: phone,
            email: email,
            password: createHash(password)
        }

        //Envio correo de bienvenida:
        const html = `<!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Maxi Barber Shop</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin: 0; padding: 0; background-color: #222; color: #fff; font-family: Arial, sans-serif;">

        <div style="max-width: 600px; margin: auto; padding: 20px; background-color: #222; color: #fff; text-align: center;">
            <h1 style="font-size: 24px; margin-bottom: 20px; color:#19b319;">¡Te damos la bienvenida a Maxi Barber Shop!</h1>
            <h3 style="font-size: 22px; margin-bottom: 20px;">¡Hola, ${newUser.names}!</h3>
            <p style="font-size: 16px; margin-bottom: 20px;">
                Nos alegra mucho tenerte con nosotros. Ahora podrás reservar tu turno por este medio en Maxi Barber Shop. Te esperamos pronto.
            </p>
            <hr style="border: 0; border-top: 1px solid #444; margin-bottom: 20px;"/>
            <footer>
                <h4 style="font-size: 16px; margin-top: 0; color:#0d590d;">Atentamente: team Maxi</h4>
            </footer>
        </div>

        </body>
        </html>`

        sendMail(html, newUser.email)

        await userManager.createUser(newUser)

        res.status(201).json({
            message: `Registro exitoso`
        })
    } catch (e) {
        return res.status(500).json({
            message: "Error al registrarse"
        })
    }
})

//Enviar restablecimiento
userRouter.post("/restablecimientodecontrasena", async (req, res) => {
    try {
        const { email } = req.body

        if (email === "" || undefined) {
            return res.status(401).json({
                message: "¡Completa el campo!"
            })
        }

        const user = await userManager.getUserByEmail(email)
        if (!user) {
            return res.status(404).json({
                message: "El correo no esta registrado"
            })
        }

        //Envio correo:
        const html = `<!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Maxi Barber Shop</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin: 0; padding: 0; background-color: #222; color: #fff; font-family: Arial, sans-serif;">

        <div style="max-width: 600px; margin: auto; padding: 20px; background-color: #222; color: #fff; text-align: center;">
            <h1 style="font-size: 24px; margin-bottom: 20px; color:#19b319;">Recuperar la contraseña de tu cuenta Maxi Barber Shop:</h1>
            <h3 style="font-size: 20px; margin-bottom: 20px;">¡Hola, ${user.names}!</h3>
            <p style="font-size: 16px; margin-bottom: 20px;">
                Solicitaste la recuperacion de contraseña de tu cuenta Maxi.
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
                Para restablecer tu contraseña da click <a href="${process.env.URL_FRONTEND}/restablecer/${user.id}">AQUI</a> y sigue con los pasos, gracias por preferirnos.
            </p>
            <hr style="border: 0; border-top: 1px solid #444; margin-bottom: 20px;"/>
            <footer>
                <h4 style="font-size: 16px; margin-top: 0; color:#0d590d;">Atentamente: team Maxi</h4>
            </footer>
        </div>

        </body>
        </html>`

        sendMail(html, email)

        return res.status(200).json({
            message: "Se envio un correo a la direccion ¡Verifica tu email!"
        })

    } catch (e) {
        return res.status(500).json({
            message: "Error al restablecer la contraseña"
        })
    }
})

//Restablecer contraseña
userRouter.put("/restablecer/:uid", async (req, res) => {
    try {
        const uid = req.params.uid

        const user = await userManager.getUserById(uid)

        if (!user) {
            return res.status(404).json({
                message: "No se encontró el usuario"
            })
        }

        const { newPass, confirmNewPass } = req.body

        if (newPass === "" || confirmNewPass === "") {
            return res.status(401).json({
                message: "Completa todos los campos"
            })
        }

        if (newPass !== confirmNewPass) {
            return res.status(401).json({
                message: "Las contraseñas no son iguales"
            })
        }

        const password = createHash(confirmNewPass)

        //Envio correo:
        const html = `<!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Maxi Barber Shop</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin: 0; padding: 0; background-color: #222; color: #fff; font-family: Arial, sans-serif;">

        <div style="max-width: 600px; margin: auto; padding: 20px; background-color: #222; color: #fff; text-align: center;">
            <h1 style="font-size: 24px; margin-bottom: 20px; color:#19b319;">¡Contraseña restablecida exitosamente!</h1>
            <h3 style="font-size: 20px; margin-bottom: 20px;">¡Hola, ${user.names}!</h3>
            <p style="font-size: 16px; margin-bottom: 20px;">
                (Este es un correo informativo).
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
                Se restableció exitosamente la contraseña de tu cuenta Maxi, si no fuiste tú ponte en contacto con soporte, en caso contrario hacer caso omiso.
            </p>
            <hr style="border: 0; border-top: 1px solid #444; margin-bottom: 20px;"/>
            <footer>
                <h4 style="font-size: 16px; margin-top: 0; color:#0d590d;">Atentamente: team Maxi</h4>
            </footer>
        </div>

        </body>
        </html>`

        sendMail(html, user.email)

        await userManager.updateUserPassword(uid, { password: password })

        return res.status(200).json({
            message: "Se restableció exitosamente la contraseña"
        })

    } catch (e) {
        return res.status(500).json({
            message: "Error al restablecer la contraseña"
        })
    }
})

//Consultar reservas (Admin):
userRouter.get("/reservas/:adminId", authAdmin, async (req, res) => {
    try {
        const bookings = await userManager.adminGetBookings()

        const now = new Date().toLocaleDateString()
        const hours = new Date().getHours().toString().padStart(2, '0')
        const minutes = new Date().getMinutes().toString().padStart(2, '0')

        const time24HoursFormat = `${hours}:${minutes}`

        const bookingsSuccess = []

        //Recorro cada reserva y elimino si ya caduco la reserva
        bookings.forEach(item => {
            const json = item.toJSON()
            if (json.Booking !== null && json.Booking.date <= now && json.Booking.time <= time24HoursFormat) {
                cleanOldBookings(json.Booking.uid)
            } else if (json.Booking !== null) {
                bookingsSuccess.push(json)
            }
        })
        async function cleanOldBookings(id) {
            await bookingManager.deleteBooking(id)
        }

        return res.status(200).json({
            body: bookingsSuccess
        })
    } catch (e) {
        return res.status(500).json({
            message: "Error al consultar las reservas"
        })
    }
});

//Crear reserva:
userRouter.post("/reservarturno/:uid", jwtVerify, async (req, res) => {
    try {
        const uid = req.params.uid
        const user = await userManager.getUserById(uid)

        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            })
        }

        const { date, time } = req.body

        if (date === "" || time === "") {
            return res.status(401).json({
                message: "Llena todos los campos"
            })
        }

        //Formateo la fecha para manejarla de una manera mas practica en la logica
        const [year, month, day] = date.split('-');
        const newFormatDate = `${day}/${month}/${year}`

        const htmlUser = `<!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Maxi Barber Shop</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin: 0; padding: 0; background-color: #222; color: #fff; font-family: Arial, sans-serif;">

        <div style="max-width: 600px; margin: auto; padding: 20px; background-color: #222; color: #fff; text-align: center;">
            <h1 style="font-size: 24px; margin-bottom: 20px; color:#19b319;">¡Turno reservado exitosamente!</h1>
            <h3 style="font-size: 20px; margin-bottom: 20px;">¡Hola, ${user.names}!</h3>
            <p style="font-size: 16px; margin-bottom: 20px;">
                Haz reservado con exito tu turno en Maxi Barber Shop para el ${newFormatDate} a las ${time} horas, para cancelar o reagendar tu turno inicia sesion en nuestra plataforma y en tu perfil podras gestionarlo.
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
                ¡Gracias por elegirnos!
            </p>
            <hr style="border: 0; border-top: 1px solid #444; margin-bottom: 20px;"/>
            <footer>
                <h4 style="font-size: 16px; margin-top: 0; color:#0d590d;">Atentamente: team Maxi</h4>
            </footer>
        </div>

        </body>
        </html>`

        const htmlAdmin = `<!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Maxi Barber Shop</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin: 0; padding: 0; background-color: #222; color: #fff; font-family: Arial, sans-serif;">

        <div style="max-width: 600px; margin: auto; padding: 20px; background-color: #222; color: #fff; text-align: center;">
            <h1 style="font-size: 24px; margin-bottom: 20px; color:#19b319;">¡Nuevo turno reservado!</h1>
            <p style="font-size: 16px; margin-bottom: 20px;">
                (Notificacion nuevo turno reservado)
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
                Reserva realizada con exito para el ${newFormatDate} a las ${time} horas para ${user.names} ${user.surnames}
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
                Para más detalles, ingresa a la plataforma.
            </p>
        </div>

        </body>
        </html>`

        //Envio correo al usuario:
        sendMail(htmlUser, user.email)

        //Envio correo al administrador:
        sendMail(htmlAdmin, `${process.env.ADMIN_EMAIL}`)

        const newBooking = {
            date: newFormatDate,
            time: time,
            uid: uid
        }

        await bookingManager.createBooking(newBooking)

        return res.status(201).json({
            message: `Reserva creada con éxito`
        })
    } catch (e) {
        return res.status(500).json({
            message: "Error al crear la reserva, intenta de nuevo"
        })
    }
});

//Cancelar turno:
userRouter.delete("/cancelarturno/:uid", jwtVerify, async (req, res) => {
    try {
        const uid = req.params.uid

        const user = await userManager.getUserById(uid)
        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            })
        }

        await bookingManager.deleteBooking(uid)

        return res.status(200).json({
            message: "¡Turno cancelado exitosamente!"
        })
    } catch (e) {
        return res.secure(500).json({
            message: "Error al cancelar el turno"
        })
    }
})

export default userRouter;