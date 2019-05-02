var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('../config/config');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


router.post('/register', function(req, res) {
  
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    
    var token = jwt.sign({ email : req.body.email,password:req.body.password }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });

      res.status(200).send({ auth: true, token: token });
  });

  router.get('/me', function(req, res) {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      
      res.status(200).send(decoded);
    });
  });

  module.exports = router;
