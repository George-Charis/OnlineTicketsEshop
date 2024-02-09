const jwt = require('jsonwebtoken');

//middleware to check if access token is not expired
const verifyJWT = (req, res, next) => {

    const authHeader = req.headers.authorization || req.headers.Authorization;
    if(!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);

    token = authHeader.split(' ')[1];

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if(err) return res.sendStatus(403);
            
            next();
        }
    )
}

module.exports = verifyJWT