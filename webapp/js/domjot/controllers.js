// ## domjot controllers
define(["jquery", "backbone", "underscore", "async", "domjot/utils",
        "domjot/models", "domjot/views"], 
        function ($, i1, i2, i3, utils, models, views) {

    var MainController = function (options) {
        this.options = _.extend({
        
        }, options || {});
        this.cid = _.uniqueId('controller');
        this.initialize.apply(this, arguments);
    }

    _.extend(Backbone.View.prototype, Backbone.Events, {
    
        initialize: function () {
        }
        
    })

    return {
        MainController: MainController
    }
});
