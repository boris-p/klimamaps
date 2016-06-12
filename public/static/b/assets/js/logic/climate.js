//this is actually climate and moving information
var climate = climate || function (pageName) {
        gPage.call(this,pageName);
        l("in climate constructor");
    };
// inherit gPage & correct the constructor pointer because it points to gPage
climate.prototype = Object.create(gPage.prototype);
climate.prototype.constructor = climate;

//overriding page init
climate.prototype.init = function() {
    var self = this;
    l("in climate init");
    l(this.pageName);

    //TODO - move these setting elsewhere to some config
    //instead of loading just one result at a time we're getting a chunk from time X to time X + timeChunkToLoad (in minutes)
    //now it's 240 so we're loading 4 hour time chunks, might need to adjust something so that the request doesn't take long
    this.timeChunkToLoad = 420;
    this.mapItemSize = 32;
    this.animationBaseSpeed = 1500;
    this.animationSpeed = this.animationBaseSpeed;  //this is the base value. so when the speed set by the user is in the middle this will be the speed
    //we have three types of hexagons - 0, 1 and 2. this is defined in the points file and can be changed to visualize more or less
    //without changing any f the underlying logic
    //if we set -1 we will draw all of them, if we will set 1 we will draw only the 2's ...
    this.drawHexagonsFrom = 1;
    //indicates if we're in the middle of the simulation (doesn't matter if we're paused or running)
    this.inSimulation = false;
    this.currentAnimationStep = 0;
    this.activeColorScheme = 4;
    this.totalItems = [];
    this.utciData = [];
    //when selecting date or time check if it changed before retriggering anything
    this.lastSelectedDateTime = false;
    this.dt = "";
    this.pauseAnimation = false;
    //change the domain to something meaningful - not necessarily 100
    this.colorRange = d3.scale.linear().clamp(true).domain([ 5,30]).rangeRound([ 0, 19 ]);


    d3.select('#clSlider').call(
        d3.slider().step(1).value(50).on("slide", function(evt, value) {
            self.animationSpeed = self.animationBaseSpeed  - (value *10 );
        }));

    this.initDateTimePicker();

    this.buildMap();
    //this.getRhinoData(5);

    //event handlers
    $('#clPauseAnimation').click(function(){
        console.log("toggling pause");
        if ($(this).hasClass('fa-play')) {
            self.pauseAnimation = false;
            //this means we were paused and are resuming the simulation
            if (self.inSimulation) {
                self.animateLoop();
            }
            //this means we are starting a new simulation
            else {
                self.runSimulation();
            }
            $(this).removeClass('fa-play').addClass('fa-pause');
        } else{
            self.pauseAnimation = true;
            $(this).removeClass('fa-pause').addClass('fa-play');
        }
    });


    $('#clOneBackwards').click(function(){
        //only run if we're paused
        if (self.pauseAnimation) {
            console.log("one backwards");
            self.currentAnimationStep--;
            self.animateLoop(true);
        }
    });
    $('#clOneForward').click(function(){
        //only run if we're paused
        if (self.pauseAnimation) {
            console.log("one forward");
            self.currentAnimationStep++;
            self.animateLoop(true);
        }
    });
    $('#climate .current-hour').html("Choose a date and time or simply press play");
};
//overriding page destruct
climate.prototype.destruct = function() {
    var self = pc.pageScripts.climate;
    //TODO - might need to clean some more variables, or maybe I should just set the object to null in the page controller?
    l("in climate destructor");
    self.inSimulation = false;
    self.pauseAnimation = false;
    clearTimeout(self.timeOut);
    clearTimeout(self.progressiveTimeOut);

    $('#clPauseAnimation').removeClass('fa-pause').addClass('fa-play');
    self.formatCurrentDateString(self.currentAnimationStep);
    self.hexagons.transition()
        .ease('easeInOutExpo')
        .style("fill", "white");
    $('#climate .current-hour').html("Choose a date and time or simply press play");
};

climate.prototype.initDateTimePicker = function(){
    var self = this;
    self.dtPick = $('#clDatetimepicker');
    self.dtPick.datetimepicker({
        onChangeDateTime:self.dateTimeAction,
        /*onShow:self.dateTimeAction,*/
        minDate:'2016/06/03',
        maxDate:'2016/12/31',
        yearStart:'2016',
        yearEnd:'2017',
        step:15,
        value:'2016/06/03 12:00',
        //onChangeDateTime:function(dp,$input){
        //  alert($input.val());}
    });
    $('#clDateTimeClick').click(function(){
        $('#clDatetimepicker').show();
        self.dtPick.datetimepicker('show');

    })
    self.currentDate = self.dtPick.datetimepicker('getValue');
};

//init the date picker
climate.prototype.dateTimeAction = function( currentDateTime,$input ) {
    l("date time changed");
    var self = pc.pageScripts.climate;
    l(currentDateTime);

    //fyi - two ways of doing the same thing
    //self.currentDate  = currentDateTime.getTime();
    self.currentDate = $input.datetimepicker('getValue');

    if (self.currentDate != self.lastSelectedDateTime){
        self.inSimulation = false;
        $('#clPauseAnimation').trigger('click');
    } else{
        l("selected date an existing ones are the same, do nothing");
    }
    l(self.currentDate / 1000);
};

climate.prototype.buildGridData = function(gridData) {
    var self = this;
    var radius = this.mapItemSize;
    //a manual fix to get the initial  placement where we want it
    xp = -25;
    yp = -70;
    var hexes = [];
    var h = (radius * Math.sqrt(3) / 2);
    gridData.forEach(function(element,row){
        var yAddition = yp + ((h*2)*row);
        //l(element);
        var numOfHexes = element.items.length;
        var startItem = parseInt(element.start);
        for (var column = 0; column < numOfHexes; column++) {

            self.totalItems.push(parseInt(element.items[column]));
            //only if the element is 2 we want to draw it . so we actually simulated more than we're showing
            //and later on perhaps have some levels of what we're showing - canopy and not canopy
            if (element.items[column]   > self.drawHexagonsFrom){
                var xAddition = xp + (radius*2*(column + startItem));
                if (row % 2 == 1) xAddition += radius;

                var hex = {
                    "x_axis": row,
                    "y_axis": column,
                    "fill": "white",
                    "stroke": "black",
                    "stroke_width": 1,
                    "luxValue": "0",
                    "class":"hex",
                    "hexagonData" :[
                        {"x": radius + xAddition, "y": yAddition},
                        {"x": radius / 2 + xAddition, "y": h + yAddition},
                        {"x": -radius / 2 + xAddition, "y": h + yAddition},
                        {"x": -radius + xAddition, "y": yAddition},
                        {"x": -radius / 2 + xAddition, "y": -h + yAddition},
                        {"x": radius / 2 + xAddition, "y": -h + yAddition} ] };
                hexes.push(hex);
            }
        }
    });
    return hexes;
};
climate.prototype.drawHexagon =  d3.svg.line()
        .x(function (d) {
            //console.log(d);
            return d.x; })
        .y(function (d) { return d.y; })
        .interpolate("cardinal-closed")
        //.interpolate("linear-closed")
        .tension("0.2");

climate.prototype.buildMap = function(){
    l("building map");
    var self = this;
    //Make an SVG Container
    var mapBase = d3.select(".main-map .utci-map-container").append("svg").attr("width", 800)
        .attr("height", 700);
    self.gridLayer = mapBase.append('g');

    //load points file
    d3.csv(BASE_PATH+"assets/js/points.pt", function(data) {
        self.dt = self.buildGridData(data);
        self.hexagons = self.gridLayer.selectAll("path").data(self.dt).enter().append("path");
        var hexAttributes = self.hexagons.attr("d",function(d){
            return self.drawHexagon(d.hexagonData)
        }).attr("x", function(d) {
            return d.x_axis;
        }).attr("y", function(d) {
            return d.y_axis;
        }).attr("class", function(d) {
            return d.class;
        }).style("fill", function(d) {
            return d.fill;
        }).style("stroke", function(d) {
            return d.stroke;
        }).style("stroke-width", function(d) {
            return d.stroke_width;
        }).on('mouseover', function(d, i) {
            self.over(d, i);
        }).on('mouseout', function(d, i) {
            self.out(d, i);
        }).on('click', function(d, i) {
            self.clickCell(d, i);
        });
    });
};

climate.prototype.runSimulation = function (){
    l("running simulation");
    var self = this;
    //stop loading more results and clear whatever we have in the cache of utci data and start loading new data
    clearTimeout(self.timeOut);
    clearTimeout(self.progressiveTimeOut);
    self.utciData = [];

    //get data
    self.getUtciData(self.currentDate);
};


climate.prototype.getUtciData =  function (d){
    var self = pc.pageScripts.climate;
    l("in getUtciData. Passed time is  " + d.getTime());
    //if we're trying to load something in the future let the user know
    if (d.getTime() > Date.now()){
        l("can't load any more results");
        //$('#climate .current-hour').html(formatDate(d)  + "<br /> can't see the future...Please try an earlier date");
        return;
    }
    //set time frame to load
    var endTime = new Date();
    endTime.setTime(d.getTime());
    endTime.setMinutes(d.getMinutes() + self.timeChunkToLoad);

    l("selected start date - " + d.getTime()/1000);
    l("selected end date - " + endTime.getTime()/1000);
    var reqString = "/utcidata?start=" + d.getTime()/1000 + "&end=" + endTime.getTime()/1000;
    l(reqString);
    d3.json(reqString , function(json) {
        //TODO - handle errors or empty results
        json.forEach(function(item,i){
            //the item contains everything from the db including point in time values for temp, radiation etc.
            //for later maybe
            var utciObj = {};
            utciObj.time_stamp = item.time_stamp;
            utciObj.points = [];
            item.pointsUtci.forEach(function(utciPointVal,j){
                //the point is relevant only if we're actually using it in the visualization
                if (self.totalItems[j] > self.drawHexagonsFrom){
                    utciObj.points.push(utciPointVal);
                }
            });
            self.utciData.push(utciObj);
        });
        //if we're not already in a running simulation initiate it
        if (!self.inSimulation) {
            self.beginAnimation();
        }
        //start progressive downloading - make a new request for the next chunk of data every 5 seconds
        //5000 is random, maybe should change it?
        self.progressiveTimeOut = setTimeout(self.getUtciData, 5000,endTime);
   });
};

climate.prototype.beginAnimation = function () {
    l("beginning animation");
    this.inSimulation = true;
    this.currentAnimationStep = 0;
    this.animateLoop();
}

//do your magic
climate.prototype.animateLoop = function (animateAnyway) {
    //setTimeout changes the scope so this is the window in the second run
    //so we access the class from the main page controller
    var self = pc.pageScripts.climate;
    //only run if we have more values to run by
    if (self.currentAnimationStep < self.utciData.length){
        animateAnyway = typeof animateAnyway !== 'undefined' ? animateAnyway : false;
        //animate if we're not in paused mode or if we're forcing it (like when moving one time steps even when paused)
        l("trying to animate");
        if (!self.pauseAnimation || animateAnyway) {
            self.timeOut = setTimeout(self.animateLoop, self.animationSpeed);
            self.colorMap(self.animationSpeed);
            //when we're paused and go one step back or forward we don't want to automatically change the time steps
            //but are doing it from above
            if (!animateAnyway){
                self.currentAnimationStep++;
            }
        }
    } else{
        self.formatCurrentDateString(self.currentAnimationStep-1,"<br />No more data is currently available");
    }
}

climate.prototype.colorMap = function (time) {
    var self = this;
    //console.log(self.rhinoData);
    /*d3.select('.current-hour').text(
        "Current simulation day - " + Math.floor(self.currentHour / 24)
        + " and hour - " + self.currentHour % 24);
    */

    self.formatCurrentDateString(self.currentAnimationStep);
    self.hexagons.transition()
        //.ease(d3_ease.easeLinear)
        .ease('easeInOutExpo')
        .style("fill", function(d, i) {
            d.utciValue = self.utciData[self.currentAnimationStep].points[i];
            return colorColors[self.activeColorScheme][self.colorRange(d.utciValue)];
        }).duration(time);
};

/*----------------------------------map interaction functions--------------------------*/
climate.prototype.formatCurrentDateString = function(timeStep,extraString){
    var self = this;
    extraString = typeof extraString !== 'undefined' ? extraString : "";
    var dText = new Date();
    if (pc.pageScripts.climate.utciData.length > 0){
        dText.setTime(self.utciData[timeStep].time_stamp * 1000);
        dText.setSeconds(0);
        $('#climate .current-hour').html(formatDate(dText) + extraString);
    }
}
climate.prototype.over = function (d, i) {
    //tip.html(createTipHtmlUTCI(d.luxValue, i)).attr('class', 'd3-tip animate').show(d);
    l(1);
    l("lux value - " + d.luxValue);
    //tip.html(createTipHtml(d.luxValue, i)).attr('class', 'd3-tip animate').show(d);
    l(2);
    ind = i + 1;
    var elmnt =this.gridLayer.select("path:nth-child(" + ind + ")");
    if (elmnt.attr("clicked") != 1) {
        elmnt.transition().style(
            "fill", "rgb(167, 79, 79)").duration(300);
    }
};
climate.prototype.out = function (d, i) {
    //tip.attr('class', 'd3-tip').show(d).hide();
    ind = i + 1;
    var elmnt =this.gridLayer.select("path:nth-child(" + ind + ")");
    if (elmnt.attr("clicked") != 1){
        elmnt.transition().style(
            "fill", "white").duration(300);
    }
    //this.gridLayer.select("path:nth-child(" + ind + ")").transition().style(
    //"fill", "white").duration(300);
};
climate.prototype.clickCell = function (d, i) {
    //not having a function assosiated with this (for now?)
    return;
    // d.transition().style("fill","blue");
    ind = i + 1;
    var elmnt =this.gridLayer.select("path:nth-child(" + ind + ")");
    var fillColor = (elmnt.attr("clicked") == 1 ? "white" : "rgb(0, 0, 255)");
    elmnt.attr("clicked","1")
        .transition().style(
        "fill", fillColor).duration(300);
};