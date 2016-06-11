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
    l("in climate init function");
    l(this.pageName);

    //TODO - move these setting elsewhere to some config
    //instead of loading just one result at a time we're getting a chunk from time X to time X + timeChunkToLoad (in minutes)
    //now it's 240 so we're loading 4 hour time chunks, might need to adjust something so that the request doesn't take long
    this.timeChunkToLoad = 300;
    this.mapItemSize = 32;
    this.animationBaseSpeed = 1500;
    this.animationSpeed = this.animationBaseSpeed;  //this is the base value. so when the speed set by the user is in the middle this will be the speed
    //we have three types of hexagons - 0, 1 and 2. this is defined in the points file and can be changed to visualize more or less
    //without changing any f the underlying logic
    //if we set -1 we will draw all of them, if we will set 1 we will draw only the 2's ...
    this.drawHexagonsFrom = 1;
    this.animate = false;
    this.currentAnimationStep = 0;
    this.activeColorScheme = 1;
    this.totalItems = [];
    this.utciData = [];
    this.dt = "";
    this.speed = 50;
    l(this.speed );
    l(pc.pageScript);
    l(pc.pageScript.speed);
    //change the domain to something meaningful - not necessarily 100
    this.colorRange = d3.scale.linear().clamp(true).domain([ 10,20]).rangeRound([ 0, 19 ]);


    d3.select('#clSlider').call(
        d3.slider().step(1).value(pc.pageScript.speed).on("slide", function(evt, value) {
        }));

    this.initDateTimePicker();

    this.buildMap();
    //this.getRhinoData(5);

    //event handlers
    $('#clRunSimulation').click(self.runSimulation);

    $('#CloneBackwards').click(function(){
        if (!self.animate) {
            console.log("one backwards");
            pc.pageScript.currentAnimationStep--;
            pc.pageScript.animateLoop(true);
        }
    });
    $('#clOneForward').click(function(){
        console.log("one forward");
        if (!self.animate) {
            pc.pageScript.currentAnimationStep++;
            pc.pageScript.animateLoop(true);
        }
    });
    $('#clPauseAnimation').click(function(){
        console.log("toggling pause");
        if (pc.pageScript.animate){
            pc.pageScript.animate = false;
        } else{
            pc.pageScript.animate = true;
            pc.pageScript.animateLoop();
        }
    });
};
//overriding page destruct
climate.prototype.destruct = function() {
    //TODO - might need to clean some more variables, or maybe I should just set the object to null in the page controller?
    l("in climate destructor");
    pc.pageScript.animate = false;
    clearTimeout(pc.pageScript.timeOut);
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
    l(currentDateTime);
    var d = $input.datetimepicker('getValue');
    if (d != null) {
        l(d.getTime() / 1000);
        pc.pageScript.currentDate = pc.pageScript.dtPick.datetimepicker('getValue');
    }
};

climate.prototype.buildGridData = function(gridData) {
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

            pc.pageScript.totalItems.push(parseInt(element.items[column]));
            //only if the element is 2 we want to draw it . so we actually simulated more than we're showing
            //and later on perhaps have some levels of what we're showing - canopy and not canopy
            if (element.items[column]   > pc.pageScript.drawHexagonsFrom){
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

climate.prototype.runSimulation =  function (){
    pc.pageScript.animate  = false;
    l("running simulation");
    pc.pageScript.getUtciData(pc.pageScript.currentDate);
};


climate.prototype.getUtciData =  function (d){
    l("in getUtciData. Passed time is  " + d.getTime());
    //try to load up till the present
    if (d.getTime() > Date.now()){
        return;
    }
    l("getting utci data");
    var self = this;
    var endTime = new Date();
    endTime.setTime(d.getTime());
    endTime.setMinutes(d.getMinutes() + pc.pageScript.timeChunkToLoad);

    l("selected start date - " + d.getTime()/1000);
    l("selected end date - " + endTime.getTime()/1000);
    var reqString = "/utcidata?start=" + d.getTime()/1000 + "&end=" + endTime.getTime()/1000;
    l(reqString);

    d3.json(reqString , function(json) {
        l(json);
        json.forEach(function(item,i){
            //the item contains everything from the db including point in time values for temp, radiation etc.
            //for later maybe
            var utciObj = {};
            utciObj.time_stamp = item.time_stamp;
            utciObj.points = [];
            item.pointsUtci.forEach(function(utciPointVal,j){
                //the point is relevant only if we're actually using it in the visualization
                if (pc.pageScript.totalItems[j] > pc.pageScript.drawHexagonsFrom){
                    utciObj.points.push(utciPointVal);
                }
            });
            pc.pageScript.utciData.push(utciObj);
        });
        //self.rhinoData = json;
        if (!pc.pageScript.animate) {
            pc.pageScript.beginAnimation();
        }
   });

    //start progressive downloading
    //1000 is random, maybe should change it
    pc.pageScript.progressiveTimeOut = setTimeout(pc.pageScript.getUtciData, 4000,endTime);
};

climate.prototype.beginAnimation = function () {
    l("beginning animation");
    //TODO - this will have to move
    this.currentAnimationStep = 0;

    this.animate = true;
    this.animateLoop();
}

//do your magic
climate.prototype.animateLoop = function (animateAnyway) {
    //setTimeout changes the scope so this is the window in the second run
    // so for now just calling the current script from the page controller (maybe this isn't the best option,
    // or if it is should be more consistent
    //l("animating map");

    //only run if we have more values to run by
    if (pc.pageScript.currentAnimationStep < pc.pageScript.utciData.length){
        animateAnyway = typeof animateAnyway !== 'undefined' ? animateAnyway : false;
        if (pc.pageScript.animate || animateAnyway) {
            //TODO - make it work with a slider to change the speed
            pc.pageScript.timeOut = setTimeout(pc.pageScript.animateLoop, pc.pageScript.animationSpeed);
            pc.pageScript.colorMap(pc.pageScript.animationSpeed);
            if (!animateAnyway){
                pc.pageScript.currentAnimationStep++;
            }
        }
    } else{
        pc.pageScript.formatCurrentDateString(pc.pageScript.currentAnimationStep-1,"<br />No more data is currently availible");
    }
}

climate.prototype.colorMap = function (time) {
    var self = this;
    //console.log(self.rhinoData);
    /*d3.select('.current-hour').text(
        "Current simulation day - " + Math.floor(self.currentHour / 24)
        + " and hour - " + self.currentHour % 24);
    */

    self.formatCurrentDateString(pc.pageScript.currentAnimationStep);
    pc.pageScript.hexagons.transition()
        //.ease(d3_ease.easeLinear)
        .ease('easeInOutExpo')
        .style("fill", function(d, i) {
            d.utciValue = pc.pageScript.utciData[pc.pageScript.currentAnimationStep].points[i];
            return colorColors[pc.pageScript.activeColorScheme][pc.pageScript.colorRange(d.utciValue)];
        }).duration(time);
};

/*----------------------------------map interaction functions--------------------------*/
climate.prototype.formatCurrentDateString = function(timeStep,extraString){
    extraString = typeof extraString !== 'undefined' ? extraString : "";
    var dText = new Date();
    dText.setTime(pc.pageScript.utciData[timeStep].time_stamp * 1000);
    dText.setSeconds(0);
    $('#climate .current-hour').html(formatDate(dText) + extraString);
}
climate.prototype.over = function (d, i) {
    //tip.html(createTipHtmlUTCI(d.luxValue, i)).attr('class', 'd3-tip animate').show(d);
    //tip.html(createTipHtml(d.luxValue, i)).attr('class', 'd3-tip animate').show(d);
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
    // d.transition().style("fill","blue");
    return;
    ind = i + 1;
    var elmnt =this.gridLayer.select("path:nth-child(" + ind + ")");
    var fillColor = (elmnt.attr("clicked") == 1 ? "white" : "rgb(0, 0, 255)");
    elmnt.attr("clicked","1")
        .transition().style(
        "fill", fillColor).duration(300);
};