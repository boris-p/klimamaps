var points;
var dt;
function buildGridData(gridData) {
    var radius = gridData.size;
    xp = 150;
    yp = 150;
    var hexes = [];
    var xCells = 5,
    yCells = 5;
    var h = (radius * Math.sqrt(3) / 2);
    for (var i = 0; i < xCells; i++) {
        for (var j = 0; j < yCells; j++) {
            var xAddition = xp + (radius*2*i);
            //TODO - clean this a bit
            //var moreAddition = 0;
            if (j % 2 == 1) xAddition += radius;

            var yAddition = yp + ((h*2)*j);
            var hex = {
                "x_axis": i,
                "y_axis": j ,
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
                    {"x": radius / 2 + xAddition, "y": -h + yAddition}
                ]
            };
            hexes.push(hex);
        }
    }
    return hexes;
}

/*
var h = (radius * Math.sqrt(3) / 2),
    xp = 150,
    yp = 150,
    hexagonData = [
        {"x": radius + xp, "y": yp},
        {"x": radius / 2 + xp, "y": h + yp},
        {"x": -radius / 2 + xp, "y": h + yp},
        {"x": -radius + xp, "y": yp},
        {"x": -radius / 2 + xp, "y": -h + yp},
        {"x": radius / 2 + xp, "y": -h + yp}
    ];
*/

drawHexagon =  d3.svg.line()
                .x(function (d) {
                    console.log(d);
                    return d.x; })
                .y(function (d) { return d.y; })
                .interpolate("cardinal-closed")
                //.interpolate("linear-closed")
                .tension("0.2");


//Make an SVG Container
var mapBase = d3.select("body").append("svg").attr("width", 1000)
    .attr("height", 500);
var gridLayer = mapBase.append('g');

//load points file
d3.json("griddata.json", function(json) {
    points = json;
    // initiate and draw map grid
    dt = buildGridData(points);

var hexagons = gridLayer.selectAll("path").data(dt).enter().append("path");

var hexAttributes = hexagons.attr("d",function(d){
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
        //over(d, i);
    }).on('mouseout', function(d, i) {
        //out(d, i);
    }).on('click', function(d, i) {
        clickCell(d, i);
    });
});
function clickCell(d, i) {
    // d.transition().style("fill","blue");
    ind = i + 1;
    gridLayer.select("path:nth-child(" + ind + ")").transition().style(
        "fill", "rgb(0, 0, 255)").duration(300);
}