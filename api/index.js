const express = require('express');
const router = express.Router();

const routeLog = (req, res, next) => {
    console.log(`URL: ${req.url}\nBody: ${req.body}\nParams: ${Object.keys(req.query)}`)
    next();
};

router.use(routeLog);

router.get('/', async (req, res) => {
    return res.status(200).send("<h1>Welcome to Urusmarkah</h1>");
})

module.exports = router;