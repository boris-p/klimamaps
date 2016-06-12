l = function(obj){
    if (typeof obj != 'undefined') {
        console.log(obj);
    } else{
        console.log("empty log");
    }
}
var BASE_PATH = "/static/b/";

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
var colors4 = ["rgb(59,29,97)","rgb(59,29,97)","rgb(62,42,109)","rgb(68,72,137)","rgb(73,99,162)","rgb(76,108,170)",
    "rgb(99,131,189)","rgb(139,170,221)","rgb(169,199,245)","rgb(176,204,243)","rgb(196,215,201)","rgb(226,230,140)",
    "rgb(249,242,94)","rgb(254,242,83)","rgb(250,223,69)","rgb(245,188,44)","rgb(238,152,19)","rgb(235,129,2)",
    "rgb(232,122,2)","rgb(214,89,19)","rgb(191,48,40)"];

var colorColors = [colors,colors1,colors2,colors3,colors4];

var tip = d3.tip().attr('class', 'd3-tip').offset([ -10, 0 ]).html(
    function(d) {
        return "<strong>Frequency:</strong> <span style='color:red'>"
            + d.frequency + "</span>";
    });

function formatDate(d){
    return d.toDateString() + " " + d.toLocaleTimeString();
}
function createTipHtmlUTCI(luxVal, id) {
    //append existing element to another element
    //d3.select(".currentHour").select(function() {
    //return this.appendChild(document.getElementById("utciSuper"));
    //});
    return d3.select("#utciSuper").node().outerHTML;
}
function createTipHtml(luxVal, id) {
    var html = '<div class="luxValue">LuxValue - ' + luxVal + '</div>';
    html += '<div class="nodeId">Node id - ' + id +'</div>';
    return html;
}
/*------------------------page controller--------------------------*/

var pController = pController || function () {
    var self = this;
    self.pageScript = false;
    self.pageScripts = {};
    /*----------------------------functions---------------------------*/
    // jQuery to collapse the navbar on scroll
    pController.prototype.collapseNavbar = function () {
        if ($(".navbar").offset().top > 50) {
            $(".navbar-fixed-top").addClass("top-nav-collapse");
        } else {
            $(".navbar-fixed-top").removeClass("top-nav-collapse");
        }
    };

    pController.prototype.setPage = function () {
        var hash = window.location.hash.substr(1);
        if (hash != '' && $('.container#' + hash).length == 1) {
            self.scrollPage('#' + hash);
        }
    };

    pController.prototype.scrollPage = function (itemToScrollTo, event) {
        //l($(this).attr('data-script'));
        //search for the custom script associated with the page, if there is one
        var menuItem = $('.navbar-collapse ul li a[href="' + itemToScrollTo + '"]');
        self.initPageScript($(menuItem).attr('data-script'));
        var hash = itemToScrollTo.substr(1);
        $('html, body').stop().animate({
            scrollTop: $(itemToScrollTo).offset().top
        }, 1500, 'easeInOutExpo', function () {
            window.location.hash = hash == 'page-top' ? '' : hash;
        });
        if (typeof event !== 'undefined') {
            event.preventDefault();
        }
    };

    pController.prototype.initPageScript = function (pageScript) {
        l(pageScript);
        //if there was logic associated with the previously active page
        //clean it up nicely
        if (self.pageScript != false && self.pageScript.scriptName != pageScript) {
            l("calling custom page script destruct function");
            self.pageScript.destruct();
        }

        //if there's an available script associated to new active page run its init function
        if(typeof pageScript != 'undefined' && window.hasOwnProperty(pageScript)) {
            l("calling custom page script - " + pageScript);
            //we didn't already instantiate this function, do it now
            if (typeof self.pageScripts[pageScript] == 'undefined'){
                l("making new page script");
                self.pageScripts[pageScript] = new window[pageScript];
                self.pageScripts[pageScript].init(pageScript);
            } else{
                l("page script already exists");
            }
            self.pageScript = self.pageScripts[pageScript];
        } else{
            self.pageScript = false;
            l("page has no logic");
        }
    };


    /*----------------------------init actions---------------------------*/
    pController.prototype.init = function () {

        //setup bootstrap tooltips
        $('[data-toggle="tooltip"]').tooltip();

        $('[data-toggle="popover"]').popover();

        $(window).scroll(self.collapseNavbar);
        //$(document).ready(collapseNavbar);

        // jQuery for page scrolling feature - requires jQuery Easing plugin
        self.collapseNavbar();
        //set the page when loading for the first time to the relative place on the page
        self.setPage();

        $('.moreLess').click(function () {
            var moreLess = $(this);
            $(this).next().slideToggle(1000, 'easeInOutExpo', function () {
                $(moreLess).html($(moreLess).html() == 'Read more ...' ? 'Read less' : 'Read more ...');
            });
        });
        $('a.page-scroll').bind('click', function (event) {
            self.scrollPage($(this).attr('href'), event);
        });
        // Closes the Responsive Menu on Menu Item Click
        $('.navbar-collapse ul li a').click(function () {
            if ($(this).attr('class') != 'dropdown-toggle active' && $(this).attr('class') != 'dropdown-toggle') {
                $('.navbar-toggle:visible').click();
            }
        });
        $( window ).resize(function() {
            l("window width - " + $( window ).width());
            if ($( window ).width() < 768){
                l("page is very small");
            }
        });
        $('#page-top').on('activate.bs.scrollspy', function() {
            var menuItem = $('.navbar-custom .nav li.active a');
            self.initPageScript($(menuItem).attr('data-script'));
            var hash = $(menuItem).attr('href');
            l(hash);
            //changing the hash of the page without an automatic scroll
            history.pushState({}, '', hash == 'page-top' ? '' : hash);
        });
    }
}
//we can reference the active page script from here (pc)
var pc;

$(function () {
    pc = new pController();
    pc.init();

})
