//this is actually structure and moving information
var movement = movement|| function (pageName) {
        gPage.call(this,pageName);
        l("in about constructor");
    };
// inherit gPage & correct the constructor pointer because it points to gPage
movement.prototype = Object.create(gPage.prototype);
movement.prototype.constructor = movement;

//overriding page init
movement.prototype.init = function() {
    self = this;
    l("initiating movement page");
    this.firstRun = true;
    this.pauseAnimation = false;
    this.animationSpeed = 1000;
    this.basePath = "http://percolator.modcam.io/stitch/vamuseum/";

    //using date and time from the time picker
    //this.currentDate = new Date(2016, 4, 17, 6, 0, 0, 0);
    
    this.initDateTimePicker();

    //var path = "http://percolator.modcam.io/stitch/vamuseum/2016-05-16%2016:00/2016-05-16%2023:00?wp=5000";
    this.container = $('#movement .movement-img-container');
    //pc.pageScript.timeOut = setTimeout(pc.pageScript.animateLoop, this.animationSpeed);

    //event handles for buttons
    $('#mvRunSimulation').click(self.runSimulation);

    $('#mvOneBackwards').click(function(){
        console.log("one backwards");
        pc.pageScript.setDateTime(pc.pageScript.currentDate,-30);
        pc.pageScript.animateLoop(true);
    });
    $('#mvOneForward').click(function(){
        console.log("one forward");
        pc.pageScript.setDateTime(pc.pageScript.currentDate,0);
        pc.pageScript.animateLoop(true);
    });
    $('#mvPauseAnimation').click(function(){
        console.log("toggling pause");
        self.pauseAnimation = !self.pauseAnimation;
        //$('#mvPauseAnimation').removeClass('fa-pause').addClass('fa-play')
        $('#mvPauseAnimation').toggleClass('fa-pause fa-play');
    });
    //$('#datetimepicker').hide();
};
//overriding page destruct
movement.prototype.destruct = function() {
    l("in about destructor");
    clearTimeout(pc.pageScript.timeOut);
};
//delay in minutes - if we want +15 minutes we'll pass in 15
movement.prototype.setDateTime = function (d, delay ){
    d = typeof d !== 'undefined' ? d : new Date();
    delay = typeof delay !== 'undefined' ? delay : 0;
    var startTime;
    d.setMinutes(d.getMinutes() + delay);
    var month = d.getMonth() +1 ;
    var hour = d.getHours() +1 ;
    startTime = d.getFullYear() + "-" + month + "-" + d.getDate();
    startTime += " ";
    startTime  += hour;
    startTime += ":";1
    startTime += d.getMinutes();
    return startTime;
}
movement.prototype.initDateTimePicker = function(){
    var self = this;
    self.dtPick = $('#mvDatetimepicker');
    self.dtPick.datetimepicker({
        onChangeDateTime:self.dateTimeAction,
        /*onShow:self.dateTimeAction,*/
        minDate:'2016/05/17',
        maxDate:'2016/12/31',
        yearStart:'2016',
        yearEnd:'2017',
        step:15,
        value:'2016/05/17 10:00',
        //onChangeDateTime:function(dp,$input){
        //  alert($input.val());}
    });
    $('#mvDateTimeClick').click(function(){
        $('#mvDatetimepicker').show();
        self.dtPick.datetimepicker('show');

    })
    self.currentDate = self.dtPick.datetimepicker('getValue');
};
//init the date picker
movement.prototype.dateTimeAction = function( currentDateTime,$input ) {

    console.log(currentDateTime);
    //var d = $('#input').datetimepicker('getValue');
    var d = $input.datetimepicker('getValue');
    if (d != null) {
        console.log(d.getTime() / 1000);
        pc.pageScript.currentDate = pc.pageScript.dtPick.datetimepicker('getValue');
    }
};
movement.prototype.runSimulation = function () {
    pc.pageScript.pauseAnimation = false;
    console.log("running simulation");
    //$('#datetimepicker').hide();
    pc.pageScript.animateLoop();
}
movement.prototype.animateLoop = function (runAnyway) {
    runAnyway = typeof runAnyway !== 'undefined' ? runAnyway : false;

    console.log("now" + Date.now());
    console.log("selected date" + pc.pageScript.currentDate.getTime());
    
    if ( Date.now() < pc.pageScript.currentDate.getTime()){
        console.log("can't read into the future");
        $('#movement .current-hour').append("<br /> can't see the future...Please try an earlier date");
        pc.pageScript.pauseAnimation = true;
    }
    else if (!pc.pageScript.pauseAnimation || runAnyway){
        //setTimeout changes the scope so this is the window in the second run
        // so for now just calling the current script from the page controller (maybe this isn't the best option,
        // or if it is should be more consistent
        l("animating map");
        var path = pc.pageScript.basePath + pc.pageScript.setDateTime(pc.pageScript.currentDate) + "/" + pc.pageScript.setDateTime(pc.pageScript.currentDate,15) + "?wp=4000";
        l(path);
        pc.pageScript.loadImage(path,710,628,pc.pageScript.container);
    }
}

movement.prototype.loadImage = function (path, width, height, target) {
    var self = this;
    if (pc.pageScript.firstRun == true){
        pc.pageScript.firstRun = false;
        $('<img id="modcam-img" src="'+ path +'">').off().load(function() {
            $(this).width(width).height(height).prependTo(target);
            pc.pageScript.timeOut = setTimeout(self.animateLoop, pc.pageScript.animationSpeed);
            $('#movement .current-hour').html(pc.pageScript.currentDate.toString());
        });
    } else{
        $("#modcam-img").attr("src", path).off().load(function(){
            pc.pageScript.timeOut = setTimeout(self.animateLoop, pc.pageScript.animationSpeed);
            $('.current-hour').html(pc.pageScript.currentDate.toString());
        });
    }
}