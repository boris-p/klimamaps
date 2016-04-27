//var topUI = d3.select(".topUI");
//var span = topUI.append("span");
//span.html("Current simulation day and Hour").attr("class","currentHour");

//var i = 0;
var animate = false;
var speed = d3.select("#slidertext").html();
function buildGridData(xCells, yCells, cellSize) {
	initX = 0;
	initY = 500;
	curX = initX;
	curY = initY;
	var rects = [];
	for ( var i = 0; i < xCells; i++) {
		for ( var j = 0; j < yCells; j++) {
			var rect = {
				"x_axis" : curX,
				"y_axis" : curY,
				"width" : cellSize,
				"height" : cellSize,
				"fill" : "white",
				"stroke" : "gray",
				"luxValue" : "0"
			};
			rects.push(rect);
			curY -= cellSize;
		}
		curY = initY;
		curX += cellSize;
	}
	return rects;
}
var allHourVals = [];
var AccumulativeHourVals = [];
var currentHour = 0;
var activeColorScheme = 0;
// build color domain range
var colorRange = d3.scale.linear().clamp(true).domain([ 0, 500 ]).rangeRound(
		[ 0, 19 ]);
// var colors = colorbrewer.YlOrRd[9];
var colors = ["rgb(255,255,255)","rgb(253,253,253)","rgb(249,249,249)","rgb(241,241,241)",
               "rgb(231,231,231)","rgb(218,218,218)","rgb(202,202,202)","rgb(185,185,185)",
               "rgb(167,167,167)","rgb(147,147,147)","rgb(128,128,128)","rgb(108,108,108)",
               "rgb(88,88,88)","rgb(70,70,70)","rgb(53,53,53)","rgb(37,37,37)","rgb(24,24,24)",
               "rgb(14,14,14)","rgb(6,6,6)","rgb(2,2,2)","rgb(0,0,0)"];
var colors1 = [ "rgb(106,79,240)", "rgb(111,83,232)", "rgb(126,93,208)",
       		"rgb(148,108,173)", "rgb(174,127,130)", "rgb(202,146,86)",
       		"rgb(226,163,46)", "rgb(245,176,17)", "rgb(254,182,2)",
       		"rgb(255,182,0)", "rgb(254,175,0)", "rgb(253,162,0)", "rgb(252,143,0)",
       		"rgb(250,121,0)", "rgb(248,97,0)", "rgb(246,72,0)", "rgb(244,49,0)",
       		"rgb(242,29,0)", "rgb(241,13,0)", "rgb(240,3,0)", "rgb(240,0,0)" ];
var colors2 = ["rgb(255,130,160)","rgb(255,130,160)","rgb(255,130,160)",
               "rgb(255,130,160)","rgb(254,128,158)","rgb(250,124,153)","rgb(243,116,145)",
               "rgb(234,106,135)","rgb(224,93,122)","rgb(212,79,108)","rgb(200,65,94)","rgb(188,51,79)",
               "rgb(176,37,65)","rgb(166,24,52)","rgb(157,14,42)","rgb(150,6,34)","rgb(146,2,29)","rgb(145,0,27)",
               "rgb(145,0,27)","rgb(145,0,27)","rgb(145,0,27)"];
var colorColors = [colors,colors1,colors2];
function getData() {
	/*
	 * var counter = 0; d3.tsv("TEST_RUN_0.ill", function(error, data) {
	 * data.forEach(function(d) { counter++; d.date = parseDate(d.date); d.close =
	 * +d.close; }); }); alert(counter);
	 */
	hours = data.split("~");
	hours.forEach(function(hour, index) {
		allHourVals.push(hours[index].split("  ")[1].split(" "));
	});
}
var min, max;
function calculateAccumulativeData(_min, _max){
	min = _min;
	max = _max;
	var start = new Date().getTime();
	len = allHourVals[0].length;
	for ( var i = 0; i < len; i++) {
		AccumulativeHourVals[i] = 0;
	}
	
	allHourVals.forEach(function(hourVal, index) {
		hourVal.forEach(function(pointVal, index1) {
			if (pointVal > min && pointVal < max){
				AccumulativeHourVals[index1] += 1;
			}	
		});
	});
	
	//didn't get the multithreading to properly work, yet
	/*
	async.each(allHourVals, function(hourVal, callback) {
		hourVal.forEach(function(pointVal, index1) {
			if (pointVal > min && pointVal < max){
				AccumulativeHourVals[index1] += 1;
			}
			});
		callback();
		}, function	(err){
		    // if any of the file processing produced an error, err would equal that error 
		    if( err ) {
		      // One of the iterations produced an error. 
		      // All processing will now stop. 
		      console.log('A file failed to process');
		    } else {
		      console.log('All files have been processed successfully');
		    }
		});
	*/
	/*
	var p = new Parallel(allHourVals,{
		  env: {
			    min: min,
			    max: max
			  }});
	p.map(fib).then(function (data) { console.log(data);});
	*/
	
	AccumulativeHourVals.forEach(function(v,i){ 
		AccumulativeHourVals[i] = Math.floor(v/4200 * 100);
		dt[i].luxValue = AccumulativeHourVals[i];
	});
	var colorRange1 = d3.scale.linear().clamp(true).domain([ 0, 100]).rangeRound([ 0, 19 ]);
	
	squares.transition()
	.ease(d3_ease.easeLinear)
	.style("fill", function(d, i) {
		return colorColors[activeColorScheme][colorRange1(AccumulativeHourVals[i])];
	});
	var end = new Date().getTime();
	var time = end - start;
	console.log('Execution time: ' + time);
}
function fib(hourVal) {
	hourVal.forEach(function(pointVal, index1) {
		if (pointVal > global.env.min && pointVal < global.env.max){
			AccumulativeHourVals[index1] += 1;
		}
		});
	};
function beginAnimation() {
	animate = true;
	animateLoop();
}
//do your magic
function animateLoop(animateAnyway) {
	animateAnyway = typeof animateAnyway !== 'undefined' ? animateAnyway : false;
	if (animate || animateAnyway) {
		time = 20 + (100 - speed) * 10;
		setTimeout(animateLoop, time);
		colorMap(time);
		moveCirce(time*7);
		if (!animateAnyway){
			currentHour++;
		}
	}
}
function colorMap(time) {
	d3.select('.currentHour').text(
			"Current simulation day - " + Math.floor(currentHour / 24)
					+ " and hour - " + currentHour % 24);
	squares.transition()
	.ease(d3_ease.easeLinear)
	.style("fill", function(d, i) {
		d.luxValue = allHourVals[currentHour][i];
		return colorColors[activeColorScheme][colorRange(allHourVals[currentHour][i])];
	}).duration(time);
}
function changeColorScheme(sel){
	activeColorScheme = sel.value;
	colorMap(100);				
}
function changeGridColor(sel){
	squares.style("stroke",sel.value);
}
function stopAnimation() {
	animate = false;
	currentHour = 0;
	squares.transition().style("fill", "rgb(32, 217, 170)");
}
function oneStep(direction){
	animate = false;
	currentHour += direction;
	animateLoop(true);
}
function showPeopleMain(cb) {
	showPeople(cb.checked);
}
function Pause() {
	animate = false;
}
function over(d, i) {
	tip.html(createTipHtmlUTCI(d.luxValue, i)).attr('class', 'd3-tip animate').show(d);
	//tip.html(createTipHtml(d.luxValue, i)).attr('class', 'd3-tip animate').show(d);
}
function out(d, i) {
	tip.attr('class', 'd3-tip').show(d).hide();
}
function clickCell(d, i) {
	// d.transition().style("fill","blue");
	ind = i + 1;
	gridLayer.select("rect:nth-child(" + ind + ")").transition().style(
			"fill", "rgb(0, 0, 255)").duration(300);
}
function createTipHtml(luxVal, id) {
	var html = '<div class="luxValue">LuxValue - ' + luxVal + '</div>';
	html += '<div class="nodeId">Node id - ' + id +'</div>';
	return html;
}
function createTipHtmlUTCI(luxVal, id) {
	
	//append existing element to another element
	//d3.select(".currentHour").select(function() {
	    //return this.appendChild(document.getElementById("utciSuper"));
	  //});
	
	return d3.select("#utciSuper").node().outerHTML;
}


//------------------------------------------------------------main-------------------------------------------------------------

var tip = d3.tip().attr('class', 'd3-tip').offset([ -10, 0 ]).html(
		function(d) {
			return "<strong>Frequency:</strong> <span style='color:red'>"
					+ d.frequency + "</span>";
		});

//Make an SVG Container
var mapBase = d3.select("#mapContainerInner").append("svg").attr("width", 1000)
		.attr("height", 500);

mapBase.call(tip);

var gridLayer = mapBase.append('g');
var peopleLayer = mapBase.append('g');

 
// initiate and draw map grid
dt = buildGridData(60, 30, 16.66);

var squares = gridLayer.selectAll("rect").data(dt).enter().append("rect");

var circleAttributes = squares.attr("x", function(d) {
	return d.x_axis;
}).attr("y", function(d) {
	return d.y_axis;
}).attr("width", function(d) {
	return d.width;
}).attr("height", function(d) {
	return d.height;
}).style("fill", function(d) {
	return d.fill;
}).style("stroke", function(d) {
	return d.stroke;
}).on('mouseover', function(d, i) {
	over(d, i);
}).on('mouseout', function(d, i) {
	out(d, i);
}).on('click', function(d, i) {
	clickCell(d, i);
});

//init the date picker
var logic = function( currentDateTime,$input ){
	//alert($input.val());
	  // 'this' is jquery object datetimepicker
	//this.setOptions({
	 //     minTime:'8:00'
	  //  });
};
jQuery('#datetimepicker').datetimepicker({
	onChangeDateTime:logic,
    onShow:logic,
    minDate:'2016/01/01',
    maxDate:'2016/12/31',
    yearStart:'2014',
    yearEnd:'2017',
    startDate:new Date(),
    defaultDate:new Date(),
    defaultTime:'10:00'
	//onChangeDateTime:function(dp,$input){
	  //  alert($input.val());}
});

//todo get it to work with axis for the ticks
var x = d3.scale.ordinal()
		.domain([ "apple", "orange", "banana", "grapefruit" ]).rangePoints(
				[ 0, 500 ]);
d3.select('#slider1').call(
		d3.slider().step(1).value(speed).on("slide", function(evt, value) {
			d3.select('#slidertext').text(value);
			speed = value;
		}));
$(".mainContainerMenu-reg").click(function(){
	$(this).next().slideToggle(700);
	});
$(".mainContainerMenu-spe").click(function(){
	$(this).next().toggle(700);
	});
//time intensite, think of a loading symbol
getData();