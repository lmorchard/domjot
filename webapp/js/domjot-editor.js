// 
// ## domjot editor bootstrap
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

// Build module paths from libs var.
// TODO: Is this a good idea? Could the extlibs be a package, somehow?
// This also seems to break dependency tracing when optimizing.
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

    ["require", "domjot/plugins", "domjot/views"].concat(plugins),
        
    function (require, Plugins, Views/*, ...*/) {
        require.ready(function () {
            window.appview = new Views.AppView({ });
        });
    }
);
