// 
// ## domjot tests bootstrap
//

var paths = {},
    libs = {
        "extlib/": ["async", "backbone", "jquery", "jQuery.twFile", "qunit",
                    "underscore"]
    },
    plugins = [
        "domjot-markdown", 
        "domjot-metadata" 
    ];

// Build module paths from libs var.
// TODO: Is this a good idea? Could the extlibs be a package, somehow?
for (var base in libs) { 
    if (libs.hasOwnProperty(base)) {
        var mods = libs[base];
        for (var i=0; i<mods.length; i++) {
            var mod = mods[i];
            paths[mod] = base + mod;
        }
    }
}

require.config({
    catchError: { define: true },
    packagePaths: {
        "plugins": plugins
    },
    paths: paths
});

require(["underscore", "jquery", "qunit", "require", "domjot/plugins", "domjot/views",
            "domjot/tests"].concat(plugins),
function (_, $, QUnit, require, Plugins, Views, run_tests/*, ...*/) {

    QUnit.config.autostart = false;

    // Copy some imports into the window
    _.extend(window, {
        _: _, 
        $: $,
        Plugins: Plugins,
        plugin_mods: _.toArray(arguments).slice(6)
    });
    
    require.ready(function () {
        window.appview = new Views.AppView({ 
            confirm_delete: false,
            animations: false,
            success: function(appview) { 
                run_tests(appview); 
            }
        });
    });

});
