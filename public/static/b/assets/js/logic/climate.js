//this is actually climate and moving information
var climate = climate || function (pageName) {
        gPage.call(this,pageName);
        l("in climate and moving constructor");
    };
// inherit gPage & correct the constructor pointer because it points to gPage
climate.prototype = Object.create(gPage.prototype);
climate.prototype.constructor = climate;

//overriding page init
climate.prototype.init = function() {
    l("in climate init function");
    l(this.pageName);
}
//overriding page destruct
climate.prototype.destruct = function() {
    l("in climate destructor");
}