var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const { poolPromise } = require("../database/db");
var VerifyToken = require('../middleware/auth');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('../config/config');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


router.post('/register', function(req, res) {
  
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    
    var token = jwt.sign({ Username : req.body.Username,Password:req.body.Password }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });

      res.status(200).send({ auth: true, token: token });
  });
  router.post('/login', async (req, res)=> {
    var query = "select *  FROM [dbo].[User] where UserName= '" + req.body.Username + "' AND  isActive=1";
    const pool = await poolPromise;
    const result = await pool.request().query(query);
    const user=result.recordset[0];
    if(result.rowsAffected[0]==1){
      if(user.Password==req.body.Password){
        var token = jwt.sign({Id:user.Id, Username : req.body.Username,Password:req.body.Password}, config.secret, {
              expiresIn: 86400 // expires in 24 hours
            });
           res.status(200).send({ auth: true, token: token });
      }else{
        return res.status(401).send({ auth: false, token: null });
      }
    }
    else{
        return res.status(401).send({ auth: false, token: null });
      }

    console.log('Result',result.rowsAffected[0]);
    console.log('Recordset',result.recordset);

    // User.findOne({ email: req.body.email }, function (err, user) {
    //   if (err) return res.status(500).send('Error on the server.');
    //   if (!user) return res.status(404).send('No user found.');
    //   var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    //   if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
    //   var token = jwt.sign({ id: user._id }, config.secret, {
    //     expiresIn: 86400 // expires in 24 hours
    //   });
    //   res.status(200).send({ auth: true, token: token });
    // });
  });
  router.get('/me', VerifyToken,function(req, res) {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      
      res.status(200).send(decoded);
    });
  });

  module.exports = router;
