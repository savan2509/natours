const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/UserModel');
const catchAsync = require('./../units/catchAsync');
const AppError = require('./../units/appError');
const sendEmail = require('./../units/email');

    const signToken = id => {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });
    };

    const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;    

    res.cookie('jwt', token, cookieOptions);

    // Remove password from 
    user.password = undefined;

        res.status(statusCode).json({
            status: 'success',
            token,
            data: {
                    user
            }
        });
    }


exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
        createSendToken(newUser, 201, res);
        // name: req.body.name,
        // email: req.body.email,
        // password:req.body.password,
        // passwordConfirm: req.body.passwordConfirm
    });
 
//     const token = signToken(newUser._id);

//     res.status(201).json({
//         status: 'success',
//         token,
//         data: {
//                 user: newUser
//         }
//     });
// });

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
    createSendToken(user, 200, res);

    // const token = signToken(user._id); 
    // res.status(200).json({
    //     status: 'success',
    //     token
    // });
});

exports.protect = catchAsync(async(req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
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
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError("The user belonging to this token no longer exist.", 401
        )
        );
    }

    // 4) check if user changed password after the token was issued
    if ( currentUser.changedPasswordAfter(decoded.iat)){
        return next (
            new AppError('User recently changed password! Please log in again.', 401)
        );
    }

    //GRANT ACCESS TO PROTECTED ROUTE
    req.User = currentUser;
    next();
});
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'lead-guide']. role = 'user'
        if(!roles.includes(req.user.role)) {
            return next(
            new AppError('You do not have permission to perform this action', 403)
            );
    }

    next();
    };
};

exports.forgetPassword = catchAsync(async(req, res, next) => { 
    // 1) get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user){
        return next(new AppError('there is no user with email address.', 404));
    }

    // 2) generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    // 3) send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

   
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please  ignore this email!`;

    try{
        await sendEmail({
            email: user.email,
            subject: 'your password reset token (valid for 10 min)',
            message
        });
        res.status(200).json({  
            status:'success',
            message: 'Token send to email!'
        });
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again later!'),)
    }
    
}); 

exports.resetPassword = catchAsync(async(req, res, next) => {
    // 1) Get user based on the token
const hashedToken = crypto
.createHash('sha256')
.update(req.params.token)
    .digest('hex');

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires:{ $gt: Date.now() }
});

    // 2) if token has not expired, and there is user, set the new password
    if (!user) {
        return next( new AppError('Token is invalid or has expired', 400))
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    //3) update changedPasswordAt property for the user
    // 4) log the user in, send JWT
    createSendToken(user, 200, res);

    // const token = signToken(user._id); 
    // res.status(200).json({
    //     status: 'success',
    //     token
    // });
}); 

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1)  Get user from collection
    const user = await User.findById(req.body.id).select('+password');

    // 2) cheek if posted current password is correct
    
        if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
            return next(new AppError('Your current password is wrong.', 401));
        }
    

    // 3) if so, update password
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();
    // 4) log user in, send JWT
    createSendToken(user, 200, res);
});