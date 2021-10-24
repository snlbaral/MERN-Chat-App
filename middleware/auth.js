const jwt = require('jsonwebtoken')

function auth(req, res, next) {
    const token = req.header('x_access_token');
    if(!token) return res.status(401).send("No access token.");
    try {
        const decode = jwt.verify(token, "myPrivateKey");
        req.user = decode;
        next();
    } catch(err) {
        res.status(400).send("Invalid Access Token");
    }
}

module.exports = auth;