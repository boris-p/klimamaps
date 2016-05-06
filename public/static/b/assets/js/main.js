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

//a = parseInt(Date.now()/1000)

//stuff for later

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