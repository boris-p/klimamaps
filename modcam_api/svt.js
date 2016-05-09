SVTRequest = function(installation, startDate, endDate, startTime, endTime) {
	var path = installation + "/" + startDate + "%20" + startTime + "/" + 
                    endDate + "%20" + endTime;
	this.url = "http://gerrit.modcam.io:3130/extract/" + path;
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


SVT = function(data) {
	this.rawData = new Uint8Array(data);
	this.data = new Int32Array(this.rawData.buffer);
}

SVT.prototype.length = function() {
	return this.data.length;
}

SVT.prototype.sort = function() {
	return this.data.slice(0).sort();
}
