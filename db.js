import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";
import Proposal from './Proposal.js'

dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER || "root",
  process.env.DATABASE_PASS || "ysoserious",

  {
    host: process.env.DATABASE_HOST || "localhost",
    dialect: "mysql",
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("sequalize connected");
  })
  .catch((err) => {
    console.log("Sequalize Error", err);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.sequelize.dialect.supports.schemas = true;

//Main
db.proposals = Proposal(sequelize, DataTypes);

await db.proposals.schema("automation_master").sync({ force: false, alter: true });

// await db.machines.schema("saranshbalyan123gmailcom").sync({ force: true });

export default db;