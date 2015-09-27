var express = require('express');
var redis = require("redis"),
db = redis.createClient();

module.exports = (function() {
  'use strict';
  var api = express.Router();
  
  api.use(function(req,res,next){
    db.set("string key", "string val", redis.print);
    next();
  });
  
  api.get('/task',function(req,res){
    console.log (req.query);
    var location = req.query.location;
    var voltage = req.query.voltage;
    var crowd = req.query.crowd;
    var key = location + ':' + crowd + ':' + voltage;
    db.srandmember(key,function(err,reply){
      res.json(reply);
    });
  });
  
  api.post('/task',function(req,res){
    console.log (req.body);
    var location = req.body.location;
    var voltage = req.body.voltage;
    var crowd = req.body.crowd;
    var task = req.body.task;
    
    if (location && voltage && crowd && task) {
      var key = location + ':' + crowd + ':' + voltage;
      db.sadd(key,task);
      res.json({"result":"Added succesfully"});      
    }
    else {
      res.status(420);
      res.json({"result":"Bad request"});  
    }
  });
  
  return api;
})();
