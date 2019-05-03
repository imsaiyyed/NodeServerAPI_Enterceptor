var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var jwt = require('jsonwebtoken');
var config = require('../config/config');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

function verifyToken(req, res, next) {
  var token = req.headers['x-access-token'];
  if (!token)
    return res.status(403).send({ auth: false, message: 'No token provided.' });
    jwt.verify(token, config.secret, function(err, decoded) {
    if (err)
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    // if everything good, save to request for use in other routes
    //req={...req,UserId=decoded.ID}
     req.UserId = decoded.Id;
    //  req.body=req.body;
    next();
  });
}
 
  module.exports = verifyToken;
