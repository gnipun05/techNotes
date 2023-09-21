const User = require ('../models/User');
const bcrypt = require('bcrypt'); // because now we need to compare the password by decrypting it first
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// POST /auth
const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if(!username || !password){
        return res.status(400).json({message: 'All fields are required'});
    }

    const foundUser = await User.findOne({ username }).exec();

    if(!foundUser || !foundUser.active){
        return res.status(401).json({message: 'Unautharized'});
    }

    const match = await bcrypt.compare(password, foundUser.password);

    if(!match){
        return res.status(401).json({message: 'Unautharized'});
    }

    // if we have reached till this point, it means that the user is Authorized to access the API
    // so we will create a JWT token and send it back to the user
    
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m'}
    )

    const refreshToken = jwt.sign(
        {
            "username": foundUser.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )

    // Create secure cookie with refresh token 
    res.cookie('jwt', refreshToken, {
        httpOnly: true, // accessible only by web server 
        secure: true, // https
        sameSite: 'None', // cross-site cookie 
        maxAge: 7 * 24 * 60 * 60 * 1000 // cookie expiry: set to match Refresh Token
    })

    // Send accessToken containing username and roles 
    res.json({ accessToken }) // notice that we dont send the refreshToken to our user
});

// GET /auth/refresh
const refresh = asyncHandler(async (req, res) => {
    const cookies = req.cookies

    if(!cookies?.jwt)
        return res.status(401).json({message: 'Unautharized'});

    const refreshToken = cookies.jwt;

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })

            const foundUser = await User.findOne({ username: decoded.username }).exec()

            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )

            res.json({ accessToken })
        })
    )
});

// POST /auth/logout
const logout = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) //No content
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Cookie cleared' })
}

module.exports = {
    login,
    refresh,
    logout
}