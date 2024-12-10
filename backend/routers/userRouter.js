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

    try {
        const JWT = req.headers.cookie
        const [authToken, value] = JWT.split('=');
        const token = value

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
    } catch (e) {
        return res.status(500).json({
            message: "Error de autenticación"
        })
    }
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

        let json = reserve.toJSON()
        delete json.password

        const now = new Date().toLocaleDateString()
        const [day, month, year] = now.split('/');
        const formatDate = `0${day}/${month}/${year}`

        if (json.Booking !== null) {
            if (json.Booking.date < formatDate) {
                await bookingManager.deleteBooking(json.Booking.uid)
                json.Booking = null
            }

            return res.status(200).json({
                body: json
            })
        }

        return res.status(200).json({
            body: json
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

//Consultar reservas (ADMIN):
userRouter.get("/reservas/:adminId", authAdmin, async (req, res) => {
    try {
        const bookings = await userManager.adminGetBookings()

        const now = new Date().toLocaleDateString()

        const [day, month, year] = now.split('/');
        const formatDate = `0${day}/${month}/${year}`

        const bookingsSuccess = []

        //Recorro cada reserva
        bookings.forEach(item => {
            const json = item.toJSON()

            //Valido si cada usuario tiene reserva, elimino si la reserva es del dia anerior y muestro las reservas activas
            if (json.Booking !== null) {
                if (json.Booking.date < formatDate) {
                    clearOldBookings(json.id)
                } else {
                    bookingsSuccess.push(json)
                }
            }
        })

        async function clearOldBookings(id) {
            await bookingManager.deleteBooking(id)
        }

        return res.status(200).json({
            body: bookingsSuccess
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Error al consultar las reservas"
        })
    }
});

//Consultar reservas (USER): 
userRouter.get("/reservas", async (req, res) => {
    try {
        const bookings = await bookingManager.getBookings()

        return res.status(200).json({
            body: bookings
        })
    } catch (e) {
        return res.status(500).json({
            message: "Error al consultar las reservas"
        })
    }
})

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
                Haz reservado con exito tu turno en Maxi Barber Shop para el ${date} a las ${time} horas, para cancelar o reagendar tu turno inicia sesion en nuestra plataforma y en tu perfil podras gestionarlo.
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
                Reserva realizada con exito para el ${date} a las ${time} horas para ${user.names} ${user.surnames}
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
                Para más detalles, ingresa a la plataforma.
            </p>
        </div>

        </body>
        </html>`

        const reservations = []

        const bookings = await bookingManager.getBookings()
        bookings.forEach(item => {
            const json = item.toJSON()
            reservations.push(json)
        })

        //Valido si hay reservas y busco si ya existe la reserva
        if (reservations.length > 0) {
            const findDate = reservations.find(item => item.date === date && item.time === time)

            if (findDate) {
                return res.status(401).json({
                    message: "Este turno ya se encuentra reservado, intenta con otro horario"
                })
            } else {
                //Envio correo al usuario:
                sendMail(htmlUser, user.email)

                //Envio correo al administrador:
                sendMail(htmlAdmin, `${process.env.ADMIN_EMAIL}`)

                const newBooking = {
                    date,
                    time,
                    uid
                }

                await bookingManager.createBooking(newBooking)

                return res.status(201).json({
                    message: `Reserva creada con éxito`
                })
            }
        }

        //Envio correo al usuario:
        sendMail(htmlUser, user.email)

        //Envio correo al administrador:
        sendMail(htmlAdmin, `${process.env.ADMIN_EMAIL}`)

        const newBooking = {
            date,
            time,
            uid
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
        return res.status(500).json({
            message: "Error al cancelar el turno"
        })
    }
})

//Modificar turno:
userRouter.put("/reagendarturno/:uid", jwtVerify, async (req, res) => {
    try {
        const uid = req.params.uid

        const user = await userManager.userGetBookingById(uid)
        if (!user) {
            return res.status(404).json({
                message: "El usuario no existe"
            })
        }

        const { date, time } = req.body
        if (date === "" || time === "") {
            return res.status(401).json({
                message: "Llena todos los campos"
            })
        }

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
            <h1 style="font-size: 24px; margin-bottom: 20px; color:#19b319;">¡Turno reagendado exitosamente!</h1>
            <h3 style="font-size: 20px; margin-bottom: 20px;">¡Hola, ${user.names}!</h3>
            <p style="font-size: 16px; margin-bottom: 20px;">
                Haz reagendado con exito tu turno para el ${newFormatDate} a las ${time} horas, si no fuiste tú ponte en contacto con soporte, en caso contrario hacer caso omiso.
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
            <h1 style="font-size: 24px; margin-bottom: 20px; color:#19b319;">¡Turno reagendado!</h1>
            <p style="font-size: 16px; margin-bottom: 20px;">
                Se acaba de reagendar un turno para el ${newFormatDate} a las ${time} horas para el usuario ${user.names} ${user.surnames}
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

        await bookingManager.updateBooking(user.Booking.id, {
            date,
            time
        })

        return res.status(200).json({
            message: "Turno reagendado exitosamente"
        })
    } catch (e) {
        return res.status(500).json({
            message: "Error al reagendar el turno, intentalo de nuevo"
        })
    }
})

export default userRouter;