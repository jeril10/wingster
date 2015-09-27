var express = require('express');
module.exports = (function() {
    'use strict';
    var viewsRoute = express.Router();

    viewsRoute.get('/', function(req, res) {
        res.render('index');
    });

    return viewsRoute;
})();
