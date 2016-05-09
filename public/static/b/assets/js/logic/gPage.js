//generic page
var gPage= function (name) {
        l("in page constructor");
        this.pageName = name;
    };
gPage.prototype.init = function() {
    l("in page init");
}
gPage.prototype.getPAgeName = function() {
    l("in page init");
}
gPage.prototype.destruct = function() {
    l("in page destructor");
}