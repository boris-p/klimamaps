//this is actually structure and moving information
var movements = movements|| function (pageName) {
        gPage.call(this,pageName);
        l("in movement constructor");
    };
// inherit gPage & correct the constructor pointer because it points to gPage
movements.prototype = Object.create(gPage.prototype);
movements.prototype.constructor = movements;

//overriding page init
movements.prototype.init = function(name) {
    this.scriptName = name;
    var self = this;
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

    $('#mvOneBackwards').click(function(){
        console.log("one backwards");
        self.setDateTime(self.currentDate,-30);
        self.animateLoop(true);
    });
    $('#mvOneForward').click(function(){
        console.log("one forward");
        self.setDateTime(self.currentDate,0);
        self.animateLoop(true);
    });
    $('#mvPauseAnimation').click(function(){
        console.log("toggling pause");
        if ($(this).hasClass('fa-play')){
            self.runSimulation();
            $(this).removeClass('fa-play').addClass('fa-pause');
        } else{
            self.pauseAnimation = true;
            $(this).removeClass('fa-pause').addClass('fa-play');
        }
    });
    $('#movement .current-hour').html("Choose a date and time or simply press play");
};
//overriding page destruct
movements.prototype.destruct = function() {
    l("in movement destructor");
    clearTimeout(pc.pageScripts.movements.timeOut);
    pc.pageScripts.movements.pauseAnimation = true;
    $('#mvPauseAnimation').removeClass('fa-pause').addClass('fa-play');
};
//delay in minutes - if we want +15 minutes we'll pass in 15
movements.prototype.setDateTime = function (d, delay ){
    d = typeof d !== 'undefined' ? d : new Date();
    delay = typeof delay !== 'undefined' ? delay : 0;
    var startTime;
    d.setMinutes(d.getMinutes() + delay);
    var month = d.getMonth() +1 ;
    var hour = d.getHours() +1 ;
    startTime = d.getFullYear() + "-" + month + "-" + d.getDate();
    startTime += " ";
    startTime  += hour + ":";
    startTime += d.getMinutes();
    return startTime;
}
movements.prototype.initDateTimePicker = function(){
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
movements.prototype.dateTimeAction = function( currentDateTime,$input ) {

    console.log(currentDateTime);
    //var d = $('#input').datetimepicker('getValue');
    var d = $input.datetimepicker('getValue');
    if (d != null) {
        console.log(d.getTime() / 1000);
        pc.pageScripts.movements.currentDate = pc.pageScripts.movements.dtPick.datetimepicker('getValue');
    }
};
movements.prototype.runSimulation = function () {
    pc.pageScripts.movements.pauseAnimation = false;
    console.log("running simulation");
    //$('#datetimepicker').hide();
    pc.pageScripts.movements.animateLoop();
};
movements.prototype.animateLoop = function (runAnyway) {
    runAnyway = typeof runAnyway !== 'undefined' ? runAnyway : false;

    console.log("now" + Date.now());
    console.log("selected date" + pc.pageScripts.movements.currentDate.getTime());
    
    if ( Date.now() < pc.pageScripts.movements.currentDate.getTime()){
        console.log("can't read into the future");
        $('#movement .current-hour').html(formatDate(pc.pageScripts.movements.currentDate) + "<br /> can't see the future...Please try an earlier date");
        l("pausing animation");
        pc.pageScripts.movements.pauseAnimation = true;
    }
    else if (!pc.pageScripts.movements.pauseAnimation || runAnyway){
        //setTimeout changes the scope so this is the window in the second run
        // so for now just calling the current script from the page controller (maybe this isn't the best option,
        // or if it is should be more consistent
        l("animating map");
        var path = pc.pageScripts.movements.basePath + pc.pageScripts.movements.setDateTime(pc.pageScripts.movements.currentDate) + "/" + pc.pageScripts.movements.setDateTime(pc.pageScripts.movements.currentDate,15) + "?wp=4000";
        l(path);
        pc.pageScripts.movements.loadImage(path,710,628,pc.pageScripts.movements.container);
    }
};

movements.prototype.loadImage = function (path, width, height, target) {
    var self =   this;
    if (pc.pageScripts.movements.firstRun == true){
        pc.pageScripts.movements.firstRun = false;
        $('<img id="modcam-img" src="'+ path +'">').off().load(function() {
            l("loaded image");
            $(this).width(width).height(height).prependTo(target);
            pc.pageScripts.movements.timeOut = setTimeout(pc.pageScripts.movements.animateLoop, pc.pageScripts.movements.animationSpeed);
            $('#movement .current-hour').html(formatDate(pc.pageScripts.movements.currentDate));
        });
    } else{
        $("#modcam-img").attr("src", path).off().load(function(){
            pc.pageScripts.movements.timeOut = setTimeout(self.animateLoop,pc.pageScripts.movements.animationSpeed);
            $('.current-hour').html(formatDate(pc.pageScripts.movements.currentDate));
        });
    }
};