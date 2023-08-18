const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead'
  });
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);






// const User = require('../model/userModel');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
// const jwt = require('jsonwebtoken');

// const createToken = (userId) => {
//   // Use a secure secret stored as an environment variable
//   const secret = process.env.JWT_SECRET;
//   return jwt.sign({ id: userId }, secret, {
//     expiresIn: '30d',
//   });
// };

// const signup = catchAsync(async (req, res, next) => {
//   const newUser = await User.create({
//     name: req.body.name,
//     email: req.body.email,
//     password: req.body.password,
//     role: req.body.role,
//   });

//   const token = createToken(newUser._id); // Assuming _id is the user's ID

//   res.status(201).json({
//     status: 'success',
//     message: 'User created successfully',
//     newUser,
//     token,
//   });
// });

// const login = catchAsync(async (req, res, next) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return next(new AppError('Please provide email and password!', 400));
//   }

//   const user = await User.findOne({ email });

//   if (!user || !(await user.correctPassword(password, user.password))) {
//     return next(new AppError('Incorrect email or password', 401));
//   }

//   const token = createToken(user._id);

//   res.status(200).json({
//     status: 'success',
//     message: 'Logged in successfully',
//     token,
//   });
// });

// const verifyToken = (req, res, next) => {
//   const token = req.headers.authorization;

//   if (!token) {
//     return res.status(401).json({ message: 'No token provided' });
//   }

//   const secret = process.env.JWT_SECRET;
//   jwt.verify(token, secret, (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ message: 'Failed to authenticate token' });
//     }

//     req.userId = decoded.id;
//     next();
//   });
// };

// module.exports = {
//   signup,
//   login,
//   verifyToken,
// };
