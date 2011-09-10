// 
// ## domjot tests bootstrap
//
var plugins = [
    "domjot-markdown", 
    "domjot-metadata" 
];
var libs = {
    "extlib/": [
        "async", "backbone", "jquery", "jQuery.twFile", "qunit",
        "underscore"
    ]
};
var paths = {};

for (var base in libs) if (libs.hasOwnProperty(base)) {
    for (var i=0, mod; mod = libs[base][i]; i++) {
        paths[mod] = base + mod;
    }
}

require(
    {
        catchError: { define: true },
        packagePaths: {
            "plugins": plugins
        },
        paths: paths
    },
    
    ["underscore", "jquery", "qunit", "require", "domjot/plugins",
         "domjot/views", "domjot/tests"].concat(plugins),

    function (_, $, QUnit, require, Plugins, Views, run_tests/*, ...*/) {

        // HACK: Copy some imports into the window to play with in Firebug
        _.extend(window, {
            _: _, 
            $: $,
            Plugins: Plugins,
            plugin_mods: _.toArray(arguments).slice(6)
        });
        
        QUnit.config.autostart = false;

        require.ready(function () {
            window.appview = new Views.AppView({ 
                confirm_delete: false,
                animations: false,
                success: function(appview) { 
                    run_tests(appview); 
                }
            });
        });

    }
);
