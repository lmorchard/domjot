({
    appDir:  "webapp",
    baseUrl: "js/",
    dir:     "webapp-build",
    // optimize: "none",
    packagePaths: {
        "plugins": [ 'domjot-markdown', 'domjot-metadata' ]
    },
    paths: {
        'async': 'extlib/async',
        'backbone': 'extlib/backbone',
        'jquery': 'extlib/jquery',
        'jQuery.twFile': 'extlib/jQuery.twFile',
        'underscore': 'extlib/underscore',
    },
    modules: [
        { 
            name: "domjot-editor",
            include: [
                "require", "domjot/plugins", "domjot/views",
                "domjot-markdown",
                "domjot-metadata"
            ]
        }
    ]
})
