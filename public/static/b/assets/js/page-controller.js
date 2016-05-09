//TODO - utility functions, move them to another class
l = function(obj){
    console.log(obj);
}
//var = function (type) {
var pController = pController || function (pages,menuItems,contentDest) {
        var self = this;
        console.log('page controller instantiated');
        //TODO - make page into an object with index , name and content
        this.currentPage = 0;
        this.pages = pages;
        this.pagesContent = [];
        this.menuItems= menuItems;
        this.contentDest = contentDest;
        this.menuItems.click(function(){
            //get the index of the menu item clicked - must be a less ugly way to do that
            var indexClicked = $(this).parents('ul').find('li').index($(this).parent())/2;

            //TODO - later we might add animations to make everything pretty
            $(self.menuItems).parent().removeClass("current");
            $(this).parent().addClass("current");
            self.currentPage = indexClicked;
            l($(self.contentDest));
            $(self.contentDest).html(self.pagesContent[self.currentPage]);
        });
        this.loadPages();
};

pController.prototype.showPages = function (){
    l(this.pages);
}
pController.prototype.loadPage = function(pageUrl,pageIndex) {
    var self = this;
    $.get(pageUrl, function( data ) {
        self.pagesContent[pageIndex] = data;
    });
}
pController.prototype.loadPages = function(){
    var self = this;
    self.pages.forEach(function(element,index,array){
        self.loadPage(element + '.html',index);
    });
}

//TODO - attach a script to every such page so the controller would know to enter its init function
//or fall back on a default one , or something
//for now just drawing the html of every such page

var pc;
$(function () {
    var pages = ["home","climate-and-moving","structure","about"];
    var menuItems = $('.main-menu a');
    pc = new pController(pages,menuItems,'.main-content-row');
})