const express = require('express');
const cors = require('cors');
const metadata = require('../routes/metadata');
const dashboard = require('../routes/dashboard');
const enterceptorapi=require('../routes/enterceptorapi');
var fs = require('fs');
var path = require("path");
var public = path.join(__dirname, "../public");
var schedule = require('node-schedule');
const {initEmailSentiment} = require('../Methods/tsvMethods');
var authentication = require('../routes/authentication');

module.exports = function (app) {
    app.use(cors());
    app.use(express.json());
    app.get('/',function (req, res) { 
     res.sendFile(path.join(public, "index.html"));
    });

    // var sentimentScheduler = schedule.scheduleJob('54 * * * *', async function(){
    //   const result = await initEmailSentiment();
    // });

    app.use("/", express.static(public));
    app.use('/api/auth',authentication );
    app.use('/api/metadata', metadata); 
    app.use('/api/dashboard', dashboard);   
    app.use('/api/enterceptorapi', enterceptorapi);
    
}
