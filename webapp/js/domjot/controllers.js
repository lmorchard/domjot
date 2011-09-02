// ## domjot controllers
define(["extlib/jquery", "extlib/backbone", "extlib/underscore",
        "extlib/async", "domjot/utils", "domjot/models", "domjot/views"], 
        function (i0, i1, i2, i3, utils, models, views) {
    var $ = jQuery;

    // ### MainController constructor
    var MainController = function (options) {
        this.initialize.apply(this, arguments);
    };

    // ### MainController methods and properties
    _.extend(MainController.prototype, Backbone.Events, {
    
        initialize: function (options) {
            var $this = this;
            this.models = models;

            this.options = _.extend({
            }, options || {});
         
            async.waterfall([
                function (next) {
                    $this.models.notes.fetch({
                        success: function () { next(); }
                    });
                },
                function (next) {
                    $this.options.article.find('> section').each(function () { 
                        views.NoteView.get($(this)).enableControls(); 
                    });
                    if (options.success) { options.success($this); }
                }
            ]);

        }
        
    });

    return {
        MainController: MainController
    };
});
