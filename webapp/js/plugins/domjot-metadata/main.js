//
// ## domjot metadata editor plugin
//
define(["jquery", "underscore", "backbone", "domjot/plugins"],
function ($, _, Backbone, plugins) {

    var meta = {
        id: "domjot-metadata",
        title: "Metadata"
    };

    var Plugin = plugins.Plugin.extend({
        
    }, meta);

    // Register the plugin and return the class
    return plugins.registry.register(Plugin);
});
