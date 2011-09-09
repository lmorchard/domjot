// ## domjot input/output utils
define(["underscore", "backbone", "domjot/utils", "require"],
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
