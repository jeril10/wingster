var express = require('express');
var redis = require("redis"),
        client = redis.createClient();

module.exports = (function() {
    'use strict';
    var api = express.Router();

    api.use(function(req,res,next){
        client.set("string key", "string val", redis.print);
        next();
    });

    api.get('/',function(req,res){
        client.lrange('mylist','0','-1',function(err,reply){
            res.json(reply);
        });
    });

    api.post('/',function(req,res){
        client.lpush('mylist',req.body.item);
        res.json({"result":"received"});
    });

    return api;
})();
