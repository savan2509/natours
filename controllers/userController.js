const User = require('./../models/UserModel');
const catchAsync = require('./../units/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // send message
    res.status(200).json({
      status: 'success',
      result: users.length,
      data: {
        users
      }
    });
  });
  
  exports.getUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };
  exports.createUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };
  exports.updateUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };
  exports.deleteUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };
  