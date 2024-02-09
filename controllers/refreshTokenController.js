const User = require('../model/User');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {

    const authHeader = req.headers.authorization || req.headers.Authorization;
    if(!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);

    token = authHeader.split(' ')[1];

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        async (err, decoded) => {
            if(err){
                const cookies = req.cookies;
                if(!cookies?.jwt) return res.sendStatus(401);
                const refreshToken = cookies.jwt;
            
                const foundUser = await User.findOne({ refreshToken }).exec();
                if(!foundUser) return res.sendStatus(403);
            
                jwt.verify(
                    refreshToken,
                    process.env.REFRESH_TOKEN_SECRET,
                    (err, decoded) => {
                        if(err || foundUser.uid !== decoded.uid) return res.sendStatus(403);
                        const accessToken = jwt.sign(
                            {
                               "UserInfo": {
                                    "uid": foundUser.uid,
                                    "email": foundUser.email,
                                    "username": foundUser.username,
                                    "role": foundUser.role 
                               }
                            },
                            process.env.ACCESS_TOKEN_SECRET,
                            { expiresIn: '30m' }
                        );
            
                        res.json({ accessToken });
                    }
                );
            }           
            return res.sendStatus(200);
        }
    ) 
}

module.exports = {handleRefreshToken}