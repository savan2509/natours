// server.js
const mongoose = require('mongoose')
const dotenv = require('dotenv');

const Live  = process.env.PORT || 3000



dotenv.config({ path: './config.env' });
const app = require('./app');

mongoose
  .connect( process.env.DATABASE_LOCAL)
  .then(() => console.log("The DB is Connected"))
  .catch((error) => console.log("Connection Failed", error.message));


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
