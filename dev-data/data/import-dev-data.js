const fs = require('fs');
const mongoose = require('mongoose')
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
// const Live  = process.env.PORT || 3000
dotenv.config({ path: './config.env' });
// const app = require('./app');
const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect( process.env.DATABASE_LOCAL)
  .then(() => console.log("The DB is Connected"))
  .catch((error) => console.log("Connection Failed", error.message));




  // READ JSON FILE
  const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

  // IMPORT DATA INFO DB
  const importData = async () => {
    console.log(tours);
    try {
        await Tour.create(tours, { validationBeforeSave: false });
        console.log('Data successfully loaded!')
    } catch (err) {
        console.log(err);
    }
    process.exit();

  };

  // DELETE ALL DATA FROM DB
  const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data successfully deleted!')
    } catch (err) {
        console.log(err);
    }
    process.exit();
  };

if(process.argv[2] === '--import') {
  importData();
} else if (process.argv [2] === '--delete') {
  deleteData();
}
