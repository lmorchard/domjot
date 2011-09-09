// ## domjot input/output utils
define(["extlib/underscore", "extlib/backbone", "domjot/utils", "require"],
        function (_, Backbone, utils, require) {

    function Storage () {
        this.initialize.apply(this, arguments);
    }
    _.extend(Storage.prototype, Backbone.Event, {

        initialize: function () {
        }

    });

    return {
        Storage: Storage
    };

});
