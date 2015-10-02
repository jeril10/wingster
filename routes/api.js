var express = require('express');
var _ = require('underscore-node');
var redis = require("redis"),
moment = require('moment'),
db = redis.createClient();

//var MongoClient = require('mongodb').MongoClient;
//var assert = require('assert');

//var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/test3');

module.exports = (function() {
  'use strict';
  var api = express.Router();
  
  api.use(function(req,res,next){
    db.set("string key", "string val", redis.print);
    next();
  });
  
  api.get('/task',function(req,res){
    console.log (req.query);
    var location = req.query.location || '*';
    var voltage = req.query.voltage || '*';
    var uuid = req.query.uuid;
    var date = req.query.date || '*';
    var userKey = null;
    var bailKey = 'bailed:' + uuid;
    console.log(bailKey);
    console.log(db.get(bailKey));
    db.get(bailKey, function(err, value) {
      var bails = 0;
      if(value) {
        bails = Number.parseInt(value);
      }
      if(bails > 5) {
        res.json({"status":"failed", "result":"You bailed out too many times"});
        return;
      }
      else {
        var id = '*';
        var match = id + ':' + date + ':' + voltage + ':' + location;
        db.keys(match, function(err, keys) {
            userKey = keys[Math.floor(Math.random() * keys.length)];
            console.log(userKey);
            db.srandmember(userKey,function(err,reply){
              res.json({'status':'success', 'bails':bails, 'task': reply});
            });
        });
      }
    });
  });
  
  api.post('/task',function(req,res){
    console.log (req.body);
    var location = req.body.location;
    var voltage = req.body.voltage;
    var task = req.body.task;
    var date = moment(new Date()).format('DD-MM-YYYY');
    var uuid = req.body.uuid;
    console.log('Date is ' + date);

    if (uuid && location && voltage && task) {
      var key = uuid + ':' + date + ':' + voltage + ':' + location;
      db.sadd(key,task);
      res.json({"result":"Added succesfully"});      
    }
    else {
      res.status(420);
      res.json({"result":"Bad request"});  
    }
  });

  api.post('/bailed' , function(req, res) {
    var uuid = req.body.uuid;
    var bailKey = 'bailed:' + uuid;
    console.log(bailKey);
    console.log(db.get(bailKey));
    db.get(bailKey, function(err, value) {
      var bails = null;
      if(!value) {
       bails = 0;
      }
      else {
        bails = Number.parseInt(value);
      }
      bails++;
      db.set('bailed:' + uuid, bails);
      db.expire('bailed:' + uuid, 7200);
      res.json({"result":"Added succesfully"});
    });
  });
  
  return api;
})();
