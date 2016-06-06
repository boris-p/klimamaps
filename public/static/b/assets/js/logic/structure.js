//this is actually structure and moving information
var structure = structure || function (pageName) {
        gPage.call(this,pageName);
        l("in structure  constructor");
    };
// inherit gPage & correct the constructor pointer because it points to gPage
structure.prototype = Object.create(gPage.prototype);
structure.prototype.constructor = structure;

//overriding page init
structure.prototype.init = function() {
    l("in structure init function");
    l(this.pageName);
    this.mapItemSize = 24;
    this.animationSpeed = 500;
    this.animate = false;
    this.currentHour = 0;
    this.activeColorScheme = 0;

    this.dt = "";

    //change the domain to something meaningful - not necessarily 100
    var colorRange = d3.scale.linear().clamp(true).domain([ 0, 50 ]).rangeRound(
        [ 0, 19 ]);
    d3.select('#slider1').call(
        d3.slider().step(1).value(speed).on("slide", function(evt, value) {
            speed = value;
        }));
    this.buildMap();
    this.getRhinoData(5);
};
//overriding page destruct
structure.prototype.destruct = function() {
    l("in structure destructor");
    pc.pageScript.animate = false;
    clearTimeout(pc.pageScript.timeOut);
};

//TODO not working yet - add the slider class or do something else to make it functional
//var speed = d3.select("#slidertext").html();

structure.prototype.buildGridData = function(gridData) {
    var radius = this.mapItemSize;
    //a manual fix to get the initial  placement where we want it
    xp = 120;
    yp = -20;
    var hexes = [];
    var h = (radius * Math.sqrt(3) / 2);
    gridData.forEach(function(element,row){
        //console.log(element.start);

        var yAddition = yp + ((h*2)*row);

        var numOfHexes = element.items.length;
        var startItem = parseInt(element.start);
        for (var column = 0; column < numOfHexes; column++) {

            if (element.items[column] == 2){
                var xAddition = xp + (radius*2*(column + startItem));
                if (row % 2 == 1) xAddition += radius;

                var hex = {
                    "x_axis": row,
                    "y_axis": column,
                    "fill": "white",
                    "stroke": "gray",
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
structure.prototype.drawHexagon =  d3.svg.line()
    .x(function (d) {
        //console.log(d);
        return d.x; })
    .y(function (d) { return d.y; })
    .interpolate("cardinal-closed")
    //.interpolate("linear-closed")
    .tension("0.2");


structure.prototype.buildMap = function(){
    l("building map");
    var self = this;
    //Make an SVG Container
    var mapBase = d3.select(".main-map").append("svg").attr("width", 800)
        .attr("height", 500);
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
structure.prototype.getRhinoData =  function (startTime){
    var self = this;
    d3.json("/rhinodata?start=" + startTime , function(json) {
        l(json);
        self.rhinoData = json;
        self.beginAnimation();
    });
};

structure.prototype.beginAnimation = function () {
    l("beginning animation");
    this.animate = true;
    this.animateLoop();
}

//do your magic
structure.prototype.animateLoop = function (animateAnyway) {
    //setTimeout chages the scope so this is the window in the second run
    // so for now just calling the current script from the page controller (maybe this isn't the best option,
    // or if it is should be more consistent
    l("animating map");
    animateAnyway = typeof animateAnyway !== 'undefined' ? animateAnyway : false;
    if (pc.pageScript.animate || animateAnyway) {
        //TODO - make it work with a slider to change the speed
        var time = pc.pageScript.animationSpeed;
        pc.pageScript.timeOut = setTimeout(pc.pageScript.animateLoop, time);
        pc.pageScript.colorMap(time);
        if (!animateAnyway){
            pc.pageScript.currentHour++;
        }
    }
}

structure.prototype.colorMap = function (time) {
    var self = this;
    d3.select('.currentHour').text(
        "Current simulation day - " + Math.floor(self.currentHour / 24)
        + " and hour - " + self.currentHour % 24);
    self.hexagons.transition()
        .ease(d3_ease.easeLinear)
        .style("fill", function(d, i) {
            //d.utciValue = allHourVals[self.currentHour][i];
            return colorColors[self.activeColorScheme][colorRange(self.rhinoData[self.currentHour]['points_rad'][i])];
        }).duration(time);
};
/*----------------------------------map interaction functions--------------------------*/

structure.prototype.over = function (d, i) {
    //tip.html(createTipHtmlUTCI(d.luxValue, i)).attr('class', 'd3-tip animate').show(d);
    ind = i + 1;
    var elmnt =this.gridLayer.select("path:nth-child(" + ind + ")");
    if (elmnt.attr("clicked") != 1) {
        elmnt.transition().style(
            "fill", "rgb(167, 79, 79)").duration(300);
    }
};
structure.prototype.out = function (d, i) {
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
structure.prototype.clickCell = function (d, i) {
    // d.transition().style("fill","blue");
    ind = i + 1;
    var elmnt =this.gridLayer.select("path:nth-child(" + ind + ")");
    var fillColor = (elmnt.attr("clicked") == 1 ? "white" : "rgb(0, 0, 255)");
    elmnt.attr("clicked","1")
        .transition().style(
        "fill", fillColor).duration(300);
};