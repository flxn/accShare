var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var utilities = require('../modules/utilities');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Account = require("../models/account.js");

mongoose.connect('mongodb://localhost/accshare');

router.get('/', function(req, res) {
    res.redirect('/');
});

router.get('/getCount', function(req, res) {
    Account.count({}, function(err, count) {
        if(err)
            res.send(err)
        res.json({ count: count });
    });
});

router.get('/autositemap', function(req, res) {
    Account.find({}).select("site").exec(function(err, data) {
        var urls = [];
        for (var i = data.length - 1; i >= 0; i--) {
            if(urls.indexOf(data[i].site) == -1) {
                urls.push(data[i].site);
            }
        };
        
        var urlxml = '';
        for (var i = urls.length - 1; i >= 0; i--) {
            urlxml += '<url><loc>https://accshare.net/' + urls[i] + '</loc></url>';
        };
        var xml = '<?xml version="1.0" encoding="UTF-8"?>\
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\
            <url><loc>https://accshare.net/</loc></url>\
                ' + urlxml + '\
        </urlset>';

        res.type("text/xml");
        res.send(xml);
    });

    
});

router.get('/:site', function(req, res) {
    Account.find({ site: new RegExp(req.params.site, "i") }).sort({ downvotes: 'asc', added: 'desc' }).limit(20).exec(function(err, accounts) {
        if(err)
            res.send(err);

        res.json(accounts);
    });

});

router.post('/add', function(req, res) {
    var account = new Account();
    account.site = utilities.unifyUrl(req.body.site);
    account.user = req.body.user;
    account.password = req.body.password;
    account.comment = req.body.comment;
    account.downvotes = 0;
    account.added = new Date().toISOString();

    Account.find({ site: account.site, user: req.body.user, password: req.body.password }, function(err, result){
        if(err)
            res.send(err);

        if(result.length == 0){
            utilities.getIcon("http://" + account.site, function(url) {
                if(!url) {
                    account.favicon = "images/favicon_default.png";
                }else{
                    account.favicon = url;
                }
                account.save(function(err){
                    if(err){
                        res.send(err);
                    }else{
                        res.json({ status: "success", site: account.site, message: "Account added." });
                    }
                });
            });
        }else{
            res.json({ status: "warning", site: account.site, message: "Account already exists." });
        }
    });
});

router.post('/downvote', function(req, res) {
    if(!req.cookies.downvoted)
        req.cookies.downvoted = []

    try {
        var userCookie = JSON.parse(req.cookies.downvoted);
    } catch (e) {
        var userCookie = req.cookies.downvoted;
    }

    var hasVoted = false;
    for(var id in userCookie){
        if(userCookie[id] == req.body.id){
            res.send({ status: "warning", message: "You already downvoted that Account." });
            hasVoted = true;
        }
    }

    if(!hasVoted){
        Account.update({ _id: req.body.id }, { $inc: { downvotes: 1 }} , function(err){
            if(err)
                res.send(err)

            userCookie.push(req.body.id);
            res.cookie('downvoted', JSON.stringify(userCookie));
            res.json({ status: "success", message: "Account downvoted." });
        });
    }
});

router.post('/resetvotes', function(req, res) {
    Account.update({ _id: req.body.id }, { downvotes: 0 } , function(err){
        if(err)
            res.send(err)

        res.json({ status: "success", message: "Votes resetted." });
    });
});

module.exports = router;
