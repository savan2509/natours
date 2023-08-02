const { promisify } = require('units');
const jwt = require('jsonwebtoken');
const User = require('./../models/UserModel');
const catchAsync = require('./../units/catchAsync');
const AppError = require('./../units/appError');

    const signToken = id => {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });
    }


exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password:req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
 
    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
                user: newUser
        }
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    
    //1) check if email and password exist
    if (!email || !password) {
       return next(new AppError('please provide email and password!', 400));
    }
    // 2) check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if(!user || !await user.correctPassword(password, user.password)) {
        return next (new AppError('Incorrect email or password', 401));
    }

    //3) if everything ok, send token to client
    const token = signToken(user._id); 
    res.status(200).json({
        status: 'success',
        token
    });
});

exports.protect = catchAsync(async(req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startWith('Bearer')
     ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return next(
            new AppError('You are not logged in! Please log in to get access.', 401));
    }
    // 2) verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) check if user still exists
    if (!freshUser) {
        return next(
            new AppError("The user belonging to this token no longer exist.", 401
        )
        );
    }

    // 4) check if user changed password after the token was issued
    freshUser.changedPasswordAfter(decoded.iat);
    next();
});