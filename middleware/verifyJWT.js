const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {

    const authHeader = req.headers.authorization || req.headers.Authorization;
    if(!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);

    token = authHeader.split(' ')[1];

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if(err) return res.sendStatus(403);
            req.uid = decoded.UserInfo.uid;
            req.user = decoded.UserInfo.username;
            req.role = decoded.UserInfo.role;
            req.email = decoded.UserInfo.email;
            next();
        }
    )
}

module.exports = verifyJWT