//this is actually structure and moving information
var about = about || function (pageName) {
        gPage.call(this,pageName);
        l("in about constructor");
    };
// inherit gPage & correct the constructor pointer because it points to gPage
about.prototype = Object.create(gPage.prototype);
about.prototype.constructor = about;

//overriding page init
about.prototype.init = function() {
    l("in about init function");
    this.firstRun = true;
    this.animationSpeed = 1000;
    this.basePath = "http://percolator.modcam.io/stitch/vamuseum/";
    this.currentDate = new Date(2016, 4, 17, 6, 0, 0, 0);

    d3.select('#slider1').call(
        d3.slider().step(1).value(speed).on("slide", function(evt, value) {
            speed = value;
        }));


    //var path = "http://percolator.modcam.io/stitch/vamuseum/2016-05-16%2016:00/2016-05-16%2023:00?wp=5000";
    this.container = $('.movement-img-container');
    //pc.pageScript.timeOut = setTimeout(pc.pageScript.animateLoop, this.animationSpeed);

    this.animateLoop();
};
//overriding page destruct
about.prototype.destruct = function() {
    l("in about destructor");
    clearTimeout(pc.pageScript.timeOut);
};
//delay in minutes - if we want +15 minutes we'll pass in 15
about.prototype.setDateTime = function (d, delay ){
    d = typeof d !== 'undefined' ? d : new Date();
    delay = typeof delay !== 'undefined' ? delay : 0;
    var startTime;
    d.setMinutes(d.getMinutes() + delay);
    var month = d.getUTCMonth() +1 ;
    var hour = d.getUTCHours() +1 ;
    startTime = d.getUTCFullYear() + "-" + month + "-" + d.getUTCDate();
    startTime += " ";
    startTime  += hour;
    startTime += ":";1
    startTime += d.getUTCMinutes();
    return startTime;
}
about.prototype.animateLoop = function () {
    //setTimeout chages the scope so this is the window in the second run
    // so for now just calling the current script from the page controller (maybe this isn't the best option,
    // or if it is should be more consistent
    l("animating map");
    var path = pc.pageScript.basePath + pc.pageScript.setDateTime(pc.pageScript.currentDate) + "/" + pc.pageScript.setDateTime(pc.pageScript.currentDate,15) + "?wp=4000";
    console.log(path);
    pc.pageScript.loadImage(path,710,628,pc.pageScript.container);
    $('.current-hour').html(pc.pageScript.currentDate.toUTCString());


}

about.prototype.loadImage = function (path, width, height, target) {
    var self = this;
    if (pc.pageScript.firstRun == true){
        pc.pageScript.firstRun = false;
        $('<img id="modcam-img" src="'+ path +'">').off().load(function() {
            $(this).width(width).height(height).appendTo(target);
            console.log("animating 2");
            pc.pageScript.timeOut = setTimeout(self.animateLoop, pc.pageScript.animationSpeed);
            //self.animateLoop();
        });
    } else{
        //$("#modcam-img").removeAttr("src").attr("src", path).load(function(){
        $("#modcam-img").attr("src", path).off().load(function(){
            console.log("animating 3");
            pc.pageScript.timeOut = setTimeout(self.animateLoop, pc.pageScript.animationSpeed);
            //self.animateLoop();
        });
    }
}