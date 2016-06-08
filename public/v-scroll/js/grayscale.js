/*!
 * Start Bootstrap - Grayscale Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery to collapse the navbar on scroll
function collapseNavbar() {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
        $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
}

$(window).scroll(collapseNavbar);
$(document).ready(collapseNavbar);

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    setPage();
    $('a.page-scroll').bind('click', function(event) {
        scrollPage($(this).attr('href'));
        /*
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo',function(){
            window.location.hash = $anchor.attr('href').substr(1);
        });
        event.preventDefault();
        */
    });
});

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
  if ($(this).attr('class') != 'dropdown-toggle active' && $(this).attr('class') != 'dropdown-toggle') {
    $('.navbar-toggle:visible').click();
  }
});
function setPage(){
    console.log("setting page");
    var hash = window.location.hash.substr(1);
    console.log(hash);
    //var page = $('.container#' + hash);
    if (hash !='' && $('.container#' + hash).length == 1){
        scrollPage('#'+hash);
    console.log($('.container#' + hash)[0]);
    //$(window).scrollTop(ele.offset().top).scrollLeft(ele.offset().top;
    }
}

function scrollPage(itemToScrollTo){
    console.log(itemToScrollTo);
    $('html, body').stop().animate({
        scrollTop: $(itemToScrollTo).offset().top
    }, 1500, 'easeInOutExpo',function(){
        window.location.hash = itemToScrollTo.substr(1);
    });
    event.preventDefault();
}