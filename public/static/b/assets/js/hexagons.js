var dt;
var rhinoData;
var mapItemSize = 24;
var hexagons;
var animationSpeed = 500;
var animate = false;

//TODO not working yet - add the slider class or do something else to make it functional
//var speed = d3.select("#slidertext").html();

var AccumulativeHourVals = [];
var currentHour = 0;
var activeColorScheme = 2;
var colorRange = d3.scale.linear().clamp(true).domain([ 0, 100 ]).rangeRound(
    [ 0, 19 ]);



function buildGridData(gridData) {
    var radius = mapItemSize;
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
}
drawHexagon =  d3.svg.line()
                .x(function (d) {
                    //console.log(d);
                    return d.x; })
                .y(function (d) { return d.y; })
                .interpolate("cardinal-closed")
                //.interpolate("linear-closed")
                .tension("0.2");

//Make an SVG Container
var mapBase = d3.select(".main-map").append("svg").attr("width", 800)
    .attr("height", 500);
var gridLayer = mapBase.append('g');

//load points file
d3.csv("assets/js/points.pt", function(data) {
    dt = buildGridData(data);
    hexagons = gridLayer.selectAll("path").data(dt).enter().append("path");
    console.log(hexagons);
    var hexAttributes = hexagons.attr("d",function(d){
        console.log("000");
        return drawHexagon(d.hexagonData)
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
            over(d, i);
        }).on('mouseout', function(d, i) {
            out(d, i);
        }).on('click', function(d, i) {
            clickCell(d, i);
        });
    });

function getRhinoData(startTime){
    d3.json("/rhinodata?start=" + startTime , function(json) {
        console.log(json);
        rhinoData = json;
        beginAnimation();
    });
}

function beginAnimation() {
    animate = true;
    animateLoop();
}
//do your magic
function animateLoop(animateAnyway) {
    console.log("animating map");
    animateAnyway = typeof animateAnyway !== 'undefined' ? animateAnyway : false;
    if (animate || animateAnyway) {
        //TODO - make it work with a slider to change the speed
        time = animationSpeed;
        setTimeout(animateLoop, time);
        colorMap(time);
        if (!animateAnyway){
            currentHour++;
        }
    }
}

function colorMap(time) {
    d3.select('.currentHour').text(
        "Current simulation day - " + Math.floor(currentHour / 24)
        + " and hour - " + currentHour % 24);
    hexagons.transition()
        .ease(d3_ease.easeLinear)
        .style("fill", function(d, i) {
            //d.utciValue = allHourVals[currentHour][i];
            return colorColors[activeColorScheme][colorRange(rhinoData[currentHour]['points_rad'][i])];
        }).duration(time);
}

function createTipHtml(luxVal, id) {
    var html = '<div class="luxValue">LuxValue - ' + luxVal + '</div>';
    html += '<div class="nodeId">Node id - ' + id +'</div>';
    return html;
}

/*----------------------------------map interaction functions--------------------------*/

function over(d, i) {
    //tip.html(createTipHtmlUTCI(d.luxValue, i)).attr('class', 'd3-tip animate').show(d);
    ind = i + 1;
    var elmnt =gridLayer.select("path:nth-child(" + ind + ")");
    if (elmnt.attr("clicked") != 1) {
        elmnt.transition().style(
            "fill", "rgb(167, 79, 79)").duration(300);
    }
}
function out(d, i) {
    //tip.attr('class', 'd3-tip').show(d).hide();
    ind = i + 1;
    var elmnt =gridLayer.select("path:nth-child(" + ind + ")");
    if (elmnt.attr("clicked") != 1){
        elmnt.transition().style(
        "fill", "white").duration(300);
    }
    //gridLayer.select("path:nth-child(" + ind + ")").transition().style(
        //"fill", "white").duration(300);
}
function clickCell(d, i) {
    // d.transition().style("fill","blue");
    ind = i + 1;
    var elmnt =gridLayer.select("path:nth-child(" + ind + ")");
    var fillColor = (elmnt.attr("clicked") == 1 ? "white" : "rgb(0, 0, 255)");
    elmnt.attr("clicked","1")
        .transition().style(
        "fill", fillColor).duration(300);
}