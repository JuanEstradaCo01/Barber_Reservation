import UserModel from "./models/userModel.js"
import BookingModel from "./models/bookingModel.js"

class UserManager {
    constructor() {
        this.model = UserModel
    }

    async adminGetBookings() {
        return this.model.findAll({
            include: [{
                model: BookingModel
            }]
        })
    }

    async getUsers() {
        return this.model.findAll()
    }

    async getUserById(id) {
        return this.model.findOne({
            where: { id: id }
        })
    }

    async getUserByEmail(email) {
        return this.model.findOne({
            where: { email: email }
        })
    }

    async createUser(body) {
        return this.model.create({
            names: body.names.toUpperCase(),
            surnames: body.surnames.toUpperCase(),
            phone: body.phone,
            email: body.email,
            password: body.password
        })
    }

    async updateUser(uid, body) {
        const user = await this.getUserById(uid)

        if (!user) {
            throw new Error("El usuario no existe")
        }

        const update = {
            names: body.names || user.names,
            surnames: body.surnames || user.surnames ,
            phone: body.phone || user.phone,
            email: body.email || user.email
        }

        return this.model.update(update, {
            where: {
                id: uid
            }
        },
        );
    }

    async updateUserPassword(uid, body) {
        const update = {
            password: body.password
        }

        return this.model.update(update, {
            where: {
                id: uid
            }
        },
        );
    }

    async deleteUser(id) {
        return this.model.destroy({
            where: {
                id: id,
            },
        })
    }
}

export default UserManager;