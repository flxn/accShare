var cheerio = require('cheerio');
var request = require('request');
var favicon = require('favicon');
module.exports = {

    unifyUrl: function(url) {
        var temp = url.replace("http://", '').replace("https://", '');
        return temp.split('/')[0];
    },

    getIcon: function(url, cb) {
        request(url, function (error, response, html) {

          if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            var path = $('link[rel^=\'apple-touch-icon\']').attr('href');
            if(path){
                path = path.replace('https:', '').replace('http:', '');
                if(path.indexOf('//') == 0){
                    cb(path);
                }else{
                    cb(url + path);
                }
            }else{
                favicon(url, function(err, faviconUrl) {
                    if(err || !url) {
                        cb(null);
                    }else{
                        cb(faviconUrl);
                    }
                });
            }
        }else{
            cb(null);
        }

        });

    }

};
