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

    api.get('/',function(req,res){
        db.lrange('mylist','0','-1',function(err,reply){
            res.json(reply);
        });
    });

    api.post('/',function(req,res){
        db.lpush('mylist',req.body.item);
        res.json({"result":"received"});
    });

    return api;
})();
