var express = require('express');
var router = express.Router();

const axios = require('axios');

async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log("in test");
    console.log(token);
    if (!token) return res.sendStatus(401);

    try {

        const response = await axios.post('http://localhost:4000/validate-token', { token });
        req.user = response.data.user;
        next();
    } catch (err) {
        res.sendStatus(403);
    }
}

router.get('/token',  authenticateToken, function(req, res, next) {
    res.send('Successfully logged in');
});


module.exports = router;
