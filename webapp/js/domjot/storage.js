// ## domjot input/output utils
define(["domjot/utils", "require"],
        function (utils, require) {

    var FileStorage = {
        
        save: function (url, content, options) {
            var r = this.mozSave(url, content, options);
            if (!r) { 
                r = this.ieSave(url, content, options);
            }
            /*
            if (!r) { 
                r = this.javaSave(url, content); 
            }
            */
            return r;
        },

        load: function (url, options) {
            var r = this.mozLoad(url, options);
            if ((r == null) || (r == false)) { 
                r = this.ieLoad(url, options); 
            }
            /*
            if ((r == null) || (r == false)) { 
                r = this.javaLoad(url); 
            }
            */
            return r;
        },

        mozSave: function (url, content, options) {
        },
        
        mozLoad: function (url, options) {
        },

        ieSave: function (url, content, options) {
        },

        ieLoad: function (url, options) {
        }
        
    };
    
    /*
    function FileAccess () {
        this.initialize.apply(this, arguments);
    }

    _.extend(FileAccess.prototype, Backbone.Event, {

        initialize: function () {
        },



    });
    */

    return {
        FileStorage: FileStorage
    };

});
