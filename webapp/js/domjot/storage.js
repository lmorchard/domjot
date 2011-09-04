// ## domjot input/output utils
define(["domjot/utils", "require"],
        function (utils, require) {

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
