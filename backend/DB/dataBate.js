import { Sequelize } from 'sequelize';
import dotenv from "dotenv"
dotenv.config();

const sequelize = new Sequelize(`${process.env.CONNECTION_DB}`);

sequelize.authenticate();
console.log(`Connected to database ${process.env.NAME_DB}`);

export default sequelize;