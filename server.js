// server.js
const mongoose = require('mongoose')
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! shuting down...');
  console.log(errname, err.message);
    process.exit(1);
});



const Live  = process.env.PORT || 3000



dotenv.config({ path: './config.env' });
const app = require('./app');

mongoose
  .connect( process.env.DATABASE_LOCAL)
  .then(() => console.log("The DB is Connected"))
  // .catch((error) => console.log("Connection Failed", error.message));


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});



process.on('unhandledRejection', err => {
  console.log('UNHANDLER REJECTION! shutting down...');
  console.log(errname, err.message);
  server.close(() => {
  process.exit(1);
  });
});


