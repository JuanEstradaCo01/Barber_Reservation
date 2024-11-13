import { DataTypes } from 'sequelize';
import sequelize from '../../DB/dataBate.js';

const BookingModel = sequelize.define('Bookings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.STRING
    },
    time: {
        type: DataTypes.STRING
    },
    uid: {
        type: DataTypes.INTEGER
    }
},
{
  timestamps: false,
}
);

export default BookingModel;