import BookingModel from "./models/bookingModel.js"

class BookingManager {
    constructor() {
        this.model = BookingModel
    }

    async getBookings() {
        return this.model.findAll()
    }

    async getBookingById(id) {
        return this.model.findOne({
            where: { id: id }
        })
    }

    async createBooking(body) {
        return this.model.create({
            date: body.date,
            time: body.time,
            uid: body.uid
        })
    }

    async deleteBooking(id) {
        return this.model.destroy({
            where: {
                uid: id,
            },
        })
    }
}

export default BookingManager;