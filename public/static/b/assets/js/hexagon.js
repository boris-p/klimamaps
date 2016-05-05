radius = 30;
var h = (radius * Math.sqrt(3)/2),
    xp = 150,
    yp = 150,
    hexagonData = [
        { "x": radius+xp,   "y": yp},
        { "x": radius/2+xp,  "y": h+yp},
        { "x": -radius/2+xp,  "y": h+yp},
        { "x": -radius+xp,  "y": yp},
        { "x": -radius/2+xp,  "y": -h+yp},
        { "x": radius/2+xp, "y": -h+yp}
    ];


drawHexagon =
    d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("cardinal-closed")
        //.interpolate("linear-closed")
        .tension("0.2");


var svgContainer =
    d3.select("body")
        .append("svg")
        .attr("width", 300)
        .attr("height", 500);


var enterElements =
    svgContainer.append("path")
        .attr("d", drawHexagon(hexagonData))
        .attr("stroke", "blue")
        .attr("stroke-width", 1)
        .attr("fill", "rgba(255,0,0,0.4)");