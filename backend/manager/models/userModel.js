import { DataTypes } from 'sequelize';
import sequelize from '../../DB/dataBate.js';
import BookingModel from "./bookingModel.js"

const UserModel = sequelize.define('Users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: "User"
    },
    names: {
        type: DataTypes.STRING
    },
    surnames: {
        type: DataTypes.STRING
    },
    phone: {
        type: DataTypes.INTEGER
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
    password: {
        type: DataTypes.STRING
    }
},
{
  timestamps: false,
}
);

UserModel.hasOne(BookingModel, {
    foreignKey: "uid"
})

BookingModel.belongsTo(UserModel, {
    foreignKey: "id"
})

export default UserModel;
