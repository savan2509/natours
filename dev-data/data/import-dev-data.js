const fs = require('fs');
const mongoose = require('mongoose')
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/UserModel');
const Review = require('./../../models/reviewModel');

dotenv.config({ path: './config.env' });

mongoose
  .connect( process.env.DATABASE_LOCAL)
  .then(() => console.log("The DB is Connected"))
  .catch((error) => console.log("Connection Failed", error.message));




  // READ JSON FILE
  const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
  const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
  const review = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));


  // IMPORT DATA INFO DB
  const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, User,{ validateBeforeSave: false } );
        await Review.create(review);
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
        await User.deleteMany();
        await Review.deleteMany();
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
 