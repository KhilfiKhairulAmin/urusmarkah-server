const express = require('express');
const router = express.Router();

const routeLog = (req, res, next) => {
    console.log(`URL: ${req.url}\nBody: ${req.body}\nParams: ${Object.keys(req.query)}`)
    next();
};

router.use(routeLog);

module.exports = router;