var request = require('request');

SVTRequest = function(installation, startDate, endDate, startTime, endTime) {
	var path = installation + "/" + startDate + "%20" + startTime + "/" + 
                    endDate + "%20" + endTime;
	//this.url = "http://gerrit.modcam.io:3130/extract/" + path;
	this.url = "http://percolator.modcam.io/extract/boris/2016-04-23%2000:00/2016-05-09%2023:50";
	console.log("test");
}

SVTRequest.prototype._handleDataArrived = function(data) {
	if(data) {
		this.cb(new SVT(data), null);
	} else {
		this.cb(null, "invalid response from server");
	}
}

SVTRequest.prototype._reqStateChanged = function() {
	if(this.req.readyState === XMLHttpRequest.DONE) {
		if(this.req.status === 200) {
			this._handleDataArrived(this.req.response);
		} else {
			this.cb(null, 'Server responded: ' + this.req.status);
		}
	}
}

SVTRequest.prototype.load = function(callback) {
	this.cb = callback;
	this.req = new XMLHttpRequest();
	this.req.responseType = "arraybuffer";
	this.req.onreadystatechange = this._reqStateChanged.bind(this);
	this.req.open('GET', this.url);
	this.req.send();

}

SVTRequest.prototype.sendReq = function(done) {
    console.log(this.url);

    var options = {
        url: this.url,
        method: 'GET',
        headers: {
            'content-type': 'arraybuffer'
        },
        encoding: null
    };

    /*
    var http = require('http');

    var options = {
        hostname: 'www.google.com',
        port: 80,
        method: 'GET'
    };
    */
    var body = [];
    var req = request(options, function(err, res, data) {
        console.log("more data");
        //console.log(data);
        console.log('headers:\n' + JSON.stringify(res.headers));

        console.log(res.statusCode) // 200
        console.log(res.headers['content-type']) // 'image/png'

        var rawData = new Uint8Array(data);
        var data = new Int32Array(rawData.buffer);
        console.log(data);
        //done(new SVT(res), null);
        //res.setEncoding(null);

    }).on('data', function (chunk) {
        //console.log("here");
        //body += chunk;
        //console.log('body:\n' + chunk);
    }).on('error', function(e) {
        console.log('problem with request: ' + e.message);
    }).on('end',function() {
        console.log("end");
        body = Buffer.concat(body).toString();
    });







    /*
    request(options, callback);

    request
        .get(this.url)
        .on('response', function(response) {
            console.log(response);
            console.log(response.statusCode) // 200
            console.log(response.headers['content-type']) // 'image/png'
        })
        .on('error', function(err) {
            console.log(err)
        })

     */
    /*
    request(this.url, function(err, res, data) {
        if (err) return done(-1);
        //if (res.statusCode !== 200) return done(new Error('Returned: ' + res.statusCode));
        console.log(res.statusCode);
        if (res.statusCode !== 200) return done(res.statusCode);
        if(data) {
            done(new SVT(data), null);
        } else {
            done(null, "invalid response from server");
        }
        /*
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
    */
};


SVT = function(data) {
    console.log(data);
	this.rawData = new Uint8Array(data);
    console.log(this.rawData);
	this.data = new Int32Array(this.rawData.buffer);
    console.log(this.data);
}

SVT.prototype.length = function() {
	return this.data.length;
}

SVT.prototype.sort = function() {
	return this.data.slice(0).sort();
}
var req = new SVTRequest();
req.sendReq(function(obj){
	console.log(obj.data);
    //console.log(response);
});

//req.load(function(obj){
//	console.log(obj.data);
//});