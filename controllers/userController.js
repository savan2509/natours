const AppError = require('../units/appError');
const User = require('./../models/UserModel');
const catchAsync = require('./../units/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj(el) = obj(el);
  });
  return newObj;
};

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
  
  exports.updateMe =catchAsync(async(req, res, next) => {
    // 1) Create error if user posts password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates, Please use /updateMyPassword.',
          400
        )
        );
    }

      // 2) filtered out unwanted fields names that are allowed to be updated
    const filteredBody = filterObj(req.body, 'email');
    // 3) update user document
    const updateUser = await User.findByIdUpdate(req.user.id, filteredBody,  {
      new: true,
      runValidators: true
      });
    
    res.status(200).json({
      status:'success',
      data: {
        user: updateUser
      }
    });
  });

    exports.deleteMe = catchAsync( async (req, res, next) => {
      await User.findByIdUpdate(req.User.id, { Active: false});

      res.status(204).json({
        status: 'success',
        data : null
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
  
  // Do Not update passwords with this!
  exports.updateUser = factory.updateOne(User);
  exports.deleteUser = factory.deleteOne(User);  