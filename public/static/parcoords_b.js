allParaVals = [];
procHeadlines = [];

function getCoordsData() {
	procHeadlines = paraHeadlines.split(",");
	paraData.split("~").forEach(function(d, index) {
		tempData = [];
		d.split(",").forEach(function(indivisualD,j){
			tempData[procHeadlines[j]] = indivisualD; 
		});
		allParaVals.push(tempData);
	});
}

getCoordsData();
// this section uses underscore.js and underscore.math
var pcz;

// color scale for zscores
var zcolorscale = d3.scale.linear()
  .domain([-2,-0.5,0.5,2])
  .range(["brown", "#999", "#999", "steelblue"])
  .interpolate(d3.interpolateLab);

/*
// load csv file and create the chart
d3.csv('examples/data/cars.csv', function(data) {
  pcz = d3.parcoords()("#example-zscore")
    .data(data)
    .hideAxis(["name"])
    .composite("darken")
    .render()
    .alpha(0.35)
    .brushMode("1D-axes")  // enable brushing
    .interactive(); // command line mode

  change_color("weight (lb)");

  // click label to activate coloring
  pcz.svg.selectAll(".dimension")
    .on("click", change_color)
    .selectAll(".label")
    .style("font-size", "14px");
});*/


pcz = d3.parcoords()("#example-zscore")
.data(allParaVals)
.hideAxis(["temperature"])
.composite("darken")
.render()
.mode("queue")
.brushedColor("#000")
.alpha(0.35)
.brushMode("1D-axes")  // enable brushing
.interactive(); // command line mode

change_color(" humidity");

// click label to activate coloring
pcz.svg.selectAll(".dimension")
.on("click", change_color)
.selectAll(".label")
.style("font-size", "14px");


// update color 
function change_color(dimension) { 
  pcz.svg.selectAll(".dimension")
    .style("font-weight", "normal")
    .filter(function(d) { return d == dimension; })
    .style("font-weight", "bold");

  pcz.color(zcolor(pcz.data(),dimension)).render();
}

// return color function based on plot and dimension
function zcolor(col, dimension) {
  var z = zscore(_(col).pluck(dimension).map(parseFloat));
  return function(d) { return zcolorscale(z(d[dimension])); }
};

// color by zscore
function zscore(col) {
  var n = col.length,
      mean = _(col).mean(),
      sigma = _(col).stdDeviation();
  return function(d) {
    return (d-mean)/sigma;
  };
};