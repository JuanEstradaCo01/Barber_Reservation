import { Router } from "express";
import UserManager from "../manager/userManager.js";
import BookingManager from "../manager/bookingManager.js";
import { createHash } from "../utils/hasheo.js"
import jwt from "jsonwebtoken"

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
    
    if(!user) {
        return res.status(400).json({
            code: 400,
            message: "La autenticación falló"
        })
    }

    if(user.role !== "Admin") {
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

userRouter.get("/user/:uid", jwtVerify , async (req, res) => {
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

        await userManager.createUser(newUser)

        res.status(201).json({
            code: 201,
            message: `Usuario creado ${names}`
        })
    } catch (e) {
        return res.status(500).json({
            code: 500,
            message: "Error al crear el usuario"
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

userRouter.delete("/deleteUser/:uid", jwtVerify,  async (req, res) => {
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

//Consultar reservas (Admin):
userRouter.get("/bookings/:adminId", authAdmin, async (req, res) => {
    try{
        const bookings = await userManager.adminGetBookings()

        return res.status(200).json(bookings)
    }catch(e){
        return res.status(500).json({
            code: 500,
            message: "Error al consultar las reservas"
        })
    }
});

//Crear reserva:
userRouter.post("/createBooking/:uid", async (req, res) => {
    try{
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
    }catch(e){
        return res.status(500).json({
            code: 500,
            message: "Error al crear la reserva, intenta de nuevo"
        })
    }
});

export default userRouter;