//global properties and methods

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
var colors3 = ["rgb(75,107,169)","rgb(115,147,202)","rgb(170,200,247)","rgb(193,213,208)","rgb(245,239,103)",
                "rgb(252,230,74)","rgb(239,156,21)","rgb(234,123,0)","rgb(234,74,0)","rgb(234,38,0)"];
var colorColors = [colors,colors1,colors2,colors3];

//TODO - not really working for now - do I want to use this or bootstrap or both... ..
function createTipHtml(val, id) {
    var html = '<div class="value">Value - ' + val + '</div>';
    html += '<div class="nodeId">Node id - ' + id +'</div>';
    return html;
}


function getWeatherData(){
    //http://localhost:3000/weatherdata?start=1462076731
    d3.json("/weatherdata?start=1462076731", function(json) {
        console.log(json.temp);
    });
}
function animateSVG(){
    var path = document.querySelector('.squiggle-animated path');
    var length = path.getTotalLength();
    // Clear any previous transition
    path.style.transition = path.style.WebkitTransition =
        'none';
    // Set up the starting positions
    path.style.strokeDasharray = length + ' ' + length;
    path.style.strokeDashoffset = length;
    // Trigger a layout so styles are calculated & the browser
    // picks up the starting position before animating
    path.getBoundingClientRect();
    // Define our transition
    path.style.transition = path.style.WebkitTransition =
        'stroke-dashoffset 2s ease-in-out';
    // Go!
    path.style.strokeDashoffset = '0';
}


//TODO - maybe later on move this to a maps.js class or something similiar

$('.main-map-container .ui-buttons .buttons-inner .fa-pause').click(function(){
    $(this).toggleClass('fa-pause fa-play')
    pause();
});
$('.main-map-container .ui-buttons .buttons-inner .fa-undo').click(function(){
    resetAnimation();
});
$('.main-map-container .ui-buttons .buttons-inner .fa-arrow-circle-left').click(function(){
    oneStep(-1)
});
$('.main-map-container .ui-buttons .buttons-inner .fa-arrow-circle-right').click(function(){
    oneStep(1)
});

function resetAnimation() {
    pause();
    currentHour = 0;
    hexagons.transition().style("fill", "rgb(32, 217, 170)");
}
function oneStep(direction){
    pause();
    currentHour += direction;
    animateLoop(true);
}
function pause() {
    animate = false;
}

//stuff for later

//a = parseInt(Date.now()/1000)

//transition the map group -
//gridLayer.transition().attr('transform','scale(.5)').duration(500);


$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

var speed = 50;
d3.select('#slider1').call(
    d3.slider().step(1).value(speed).on("slide", function(evt, value) {
        speed = value;
    }));