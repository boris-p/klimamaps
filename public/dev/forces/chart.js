var svg = dimple.newSvg(".line-graph", 960, 600);

// The default data set for these examples has regular times
// and the point of this demo is to show the time axis
// functionality, therefore a small bespoke data set is used.
data = [
    { "Shift":"temperature Diff","Date":"12 Jul 2010 10:00","Value":1000 },
    { "Shift":"temperature Diff","Date":"20 Jul 2010 10:20","Value":1200 },
    { "Shift":"temperature Diff","Date":"1 Aug 2010 10:40","Value":1600 },
    { "Shift":"temperature Diff","Date":"8 Aug 2010 10:10","Value":1300 },
    { "Shift":"temperature Diff","Date":"20 Aug 2010 11:00","Value":1900 },
    { "Shift":"temperature Diff","Date":"7 Sep 2010 09:50","Value":1100 },
    { "Shift":"temperature Diff","Date":"13 Sep 2010 10:10","Value":1000 },
    { "Shift":"temperature Diff","Date":"1 Oct 2010 12:00","Value":2000 },
    { "Shift":"temperature Diff","Date":"6 Oct 2010 10:10","Value":1900 },
    { "Shift":"temperature Diff","Date":"19 Oct 2010 11:40","Value":1800 },
    { "Shift":"temperature Diff","Date":"24 Oct 2010 10:30","Value":1200 },
    { "Shift":"temperature Diff","Date":"3 Nov 2010 09:30","Value":1800 },
    { "Shift":"temperature Diff","Date":"12 Nov 2010 10:50","Value":1800 },
    { "Shift":"temperature Diff","Date":"20 Nov 2010 10:10","Value":1900 },
    { "Shift":"temperature Diff","Date":"5 Dec 2010 10:50","Value":1600 },
    { "Shift":"temperature Diff","Date":"9 Dec 2010 12:20","Value":1700 },
    { "Shift":"temperature Diff","Date":"15 Dec 2010 10:10","Value":1400 },
    { "Shift":"temperature Diff","Date":"20 Dec 2010 10:00","Value":1200 },
    { "Shift":"stress","Date":"11 Jul 2010 16:00","Value":2400 },
    { "Shift":"stress","Date":"30 Jul 2010 17:30","Value":2000 },
    { "Shift":"stress","Date":"1 Aug 2010 15:40","Value":1600 },
    { "Shift":"stress","Date":"5 Aug 2010 13:10","Value":1700 },
    { "Shift":"stress","Date":"1 Sep 2010 15:00","Value":1900 },
    { "Shift":"stress","Date":"7 Sep 2010 15:50","Value":1100 },
    { "Shift":"stress","Date":"13 Sep 2010 14:10","Value":1500 },
    { "Shift":"stress","Date":"30 Sep 2010 13:00","Value":1000 },
    { "Shift":"stress","Date":"1 Nov 2010 15:50","Value":1800 },
    { "Shift":"stress","Date":"24 Nov 2010 15:10","Value":1900 },
    { "Shift":"stress","Date":"1 Dec 2010 15:50","Value":1600 },
    { "Shift":"stress","Date":"5 Dec 2010 15:20","Value":1700 },
    { "Shift":"stress","Date":"13 Dec 2010 15:10","Value":1400 },
    { "Shift":"stress","Date":"25 Dec 2010 15:00","Value":1200 }
];

// Create Separate Date and Time, this allows us to draw them
// on separate axes.  Despite the time axis only displaying
// the time portion, the whole date is used so they need to
// have the same date allocated
data.forEach(function (d) {
    d["Day"] = d["Date"].substring(0, d["Date"].length - 6);
    d["Time of Day"] =
        "2000-01-01 " + d["Date"].substring(d["Date"].length - 5);
}, this);

// Create the chart as usual
var myChart = new dimple.chart(svg, data);
myChart.setBounds(70, 40, 490, 320)

// Add the x axis reading dates in the format 01 Jan 2012
// and displaying them 01 Jan
var x = myChart.addTimeAxis("x", "Day", "%d %b %Y", "%d %b");

// Add the y axis reading dates and times but only outputting
// times.
var y = myChart.addTimeAxis("y", "Time of Day",
    "%Y-%m-%d %H:%M", "%H:%M");

// Size the bubbles by volume
var z = myChart.addMeasureAxis("z", "Value");

// Setting min and max dates requires them to be set
// as actual javascript date objects
x.overrideMin = new Date("2010-06-20");
x.overrideMax = new Date("2011-01-02");
y.overrideMin = new Date("01/01/2000 9:00 am");
y.overrideMax = new Date("01/01/2000 6:00 pm");

// Show a label for every 4 weeks.
x.timePeriod = d3.time.weeks;
x.timeInterval = 4;

// Control bubble sizes by setting the max and min values
z.overrideMin = 900;
z.overrideMax = 3000;

// Add the bubble series for shift values first so that it is
// drawn behind the lines
myChart.addSeries("Shift", dimple.plot.bubble);

// Add the line series on top of the bubbles.  The bubbles
// and line points will naturally fall in the same places
var s = myChart.addSeries("Shift", dimple.plot.line);

// Add line markers to the line because it looks nice
s.lineMarkers = true;

// Show a legend
myChart.addLegend(180, 10, 360, 20, "right");

// Draw everything
myChart.draw();