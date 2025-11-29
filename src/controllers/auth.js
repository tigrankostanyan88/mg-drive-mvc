const jwt = require('jsonwebtoken');

const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

const DB = require('../models');
const {
    User,
    File
} = DB.models;
const {
    Op
} = DB.Sequelize;

const createSendToken = (user, statusCode, req, res, target = false) => {
    // Determine JWT expiry based on whether user selected 'remember me' option
    const jwtExpire = req.body.remember == 'on' ? 60 : 1;
    const token = jwt.sign({
        id: user.id
    }, process.env.JWT_SECRET, {
        expiresIn: jwtExpire + 'd'
    });

    // Set cookie options for JWT token
    const cookieOptions = {
        expires: new Date(Date.now() + jwtExpire * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    // Set cookie as secunpmre if in production environment
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    // Attach JWT token to response as cookie
    res.cookie('jwt', token, cookieOptions);

    // Attach JWT token to response local variable
    res.locals.token = token;

    // Conditionally handle API response or redirect
    if (!target) {
        // Remove sensitive data from user object
        user.password = undefined;
        user.deleted = undefined;

        // Send response as JSON containing status, response time, JWT token and user data
        res.status(statusCode).json({
            status: 'success',
            time: (Date.now() - req.time) + ' ms',
            token,
            user
        });
    }
};


const logOutUser = (res) => {
    // Set cookie expiry to 2 seconds from now
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });

    res.status()
};

module.exports = {
    // SignUp method, wrapped in catchAsync to handle exceptions
    signUp: catchAsync(async (req, res, next) => {
        // Create a new user with request body data
        const findUser = await User.findOne({where: {email: req.body.email}});
        if(findUser) return next(new AppError('Այս էլ․ հասցեն արդեն  գրանցված է։'), 403);
        const user = await User.create(req.body);
        createSendToken(user, 201, req, res);
    }),
    logOut: catchAsync(async (req, res, next) => {
        // Set cookie expiry to 2 seconds from now
        res.cookie('jwt', 'loggedout', {
            expires: new Date(Date.now() + 500),
            httpOnly: true
        });

        // Return success responsenpm
        res.status(200).json({
            status: 'success',
            message: 'Օգտատերը դուրս է եկել հաշվից',
            redirect: '/'
        });
    }),
    signIn: catchAsync(async (req, res, next) => {
        // Extract email and password data from request body
        const { email, password } = req.body;

        // 1) Check if email and password exist
        if (!email || !password)
            return next(new AppError('Please provide email and password!', 400));

        // If everything is okay, continue

        // 2) Check if user exists && password is correct
        const user = await User.findOne({
            where: {
                email
            }
        });

        if(!user) return(next(new AppError('Օգտվողը չի գտնվել')))
        
        // Check if password is correct using currentPassword method of user object
        const correctPassword = await user.correctPassword(password, user.password);

        // If user or password is incorrect, throw an error with a 401 status code
        if (!user || !correctPassword)
            return next(new AppError('Incorrect email or password', 401));

        // // 3) Send token to client and return user info without the password
        createSendToken(user, 200, req, res, true);

        res.status(200).json({
            status: 'success',
            token: res.locals.token,
            time: (Date.now() - req.time + ' ms'),
            reload: true
        });
    }),
    logout: async (req, res) => {
        // Call helper function to clear cookies and log out user
        logOutUser(res);

        // Return success message in JSON format with 200 OK status code
        res.status(200).json({
            status: 'success',
            message: 'Your successfully logged out!'
        })
    },
    restrictTo: (...roles) => {
        return (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                return next(
                    new AppError('You do not have permission to perform this action, access denied', 403)
                );
            }
            next();
        };
    },
    /* Security */
    isLoggedIn: async (req, res, next) => {
        res.locals.user = undefined;

        if (req.cookies.jwt) {
            try {
                // Logout user by X-RateLimit-Remaining
                if (res.getHeader('x-ratelimit-remaining') == 0) {
                    // logoutUser(res);
                }
                // 1) verify token
                const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

                // 2) Check if user still exists
                const currentUser = await User.findByPk(decoded.id, {include: "files"});
                if (!currentUser) {
                    return next();
                }

                // 3) Check if user changed password after the token was issued
                if (currentUser.changedPasswordAfter(decoded.iat)) {
                    return next();
                }

                // THERE IS A LOGGED IN USER
                res.locals.user = currentUser.toJSON();
                return next();
            } catch (err) {
                return next();
            }
        }
        next();
    },
    // Protect routes that require authentication
    protect: catchAsync(async (req, res, next) => {
        res.locals.user = undefined;

        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt
        }
        // console.log(token);

        if (!token) {
            res.redirect('/')
            return next(new AppError('You are not logged in! Please log in to get access.', 401));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3) Check if user still exists
        const currentUser = await User.findByPk(decoded.id, { include: "files" });

        if (!currentUser) {
            res.redirect('/')
            return next(new AppError('The user belonging to this token does no longer exist.', 401));
        }

        // 4) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            res.redirect('/')
            return next(new AppError('User recently changed password! Please log in again.', 401));
        }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        // THERE IS A LOGGED IN USER
        res.locals.user = currentUser.toJSON();

        next();
    }),
    protectUser: (req, res, next) => {
        // Check if user is already logged in by checking res.locals object
        if (res.locals.user) {
            res.redirect('/')
            // If user is already logged in, throw an AppError with status 403 (Forbidden)
            return next(new AppError('You are already logged in!', 403));
        }
        // Otherwise, move to next middleware function
        next();
    }
}