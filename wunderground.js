var request = require('request');

exports.testBBB = function(a){
    console.log(a);
}

exports.getWUnderground = function(url, done) {
    console.log(url);
    request(url, function(err, res, body) {
        //console.log(body);
        if (err) return done(-1);
        //if (res.statusCode !== 200) return done(new Error('Returned: ' + res.statusCode));
        if (res.statusCode !== 200) return done(res.statusCode);
        if (body) {
            try {
                body = JSON.parse(body);
                if (body.response.error) return done(body.response.error.description);
                else return done(body);
            } catch (e) {
                return done(-1);
            }
        }
    });
}