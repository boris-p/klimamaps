var request = require('request');

var myMongo= require('./modcamdb');

SVTRequest = function(installation, startDate, endDate, startTime, endTime) {
	var path = installation + "/" + startDate + "%20" + startTime + "/" + 
                    endDate + "%20" + endTime;
	//this.url = "http://gerrit.modcam.io:3130/extract/" + path;
	this.url = "http://percolator.modcam.io/extract/boris/2016-04-23%2000:00/2016-05-09%2023:50";
}

SVTRequest.prototype.sendReq = function(done) {

    //the data is binary so the encoding needs to be set to null

    //TODO - better error handling
    var req = request({
        url: this.url,
        encoding: null
    }, function(err, res, data) {
        //console.log('headers:\n' + JSON.stringify(res.headers));
        var rawData = new Uint8Array(data);
        var data = new Int32Array(rawData.buffer);

        var modcamObj = {};
        modcamObj.time_stamp = 10;
        //modcamObj.point_vals = data.slice(0,100); // user not to save so much (for debugging)
        modcamObj.point_vals = data;
        //save data to the db
        //TODO - save timestamp as well and just in general think of the structure
        // of the db better for indexing and retrieving data
        myMongo.savemodcamData(modcamObj);

        console.log(data[20005]);
    }).on('error', function(e) {
        console.log('problem with request: ' + e.message);
    }).on('end',function() {
        console.log("finished reading data");
    });
};
var req = new SVTRequest();
req.sendReq(function(obj){
	console.log(obj.data);
});