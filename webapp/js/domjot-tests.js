// 
// ## domjot tests bootstrap
//
require(

    { 
        catchError: { define: true },
        paths: {
            'async': 'extlib/async',
            'backbone': 'extlib/backbone',
            'jquery': 'extlib/jquery',
            'jQuery.twFile': 'extlib/jQuery.twFile',
            'qunit': 'extlib/qunit',
            'underscore': 'extlib/underscore'
        }
    },

    ["qunit", "domjot/views", "domjot/tests", "require"], 
    
    function (QUnit, domjot_views, tests, require) {
        QUnit.config.autostart = false;
        require.ready(function () {
            window.appview = new domjot_views.AppView({ 
                confirm_delete: false,
                animations: false,
                success: function(appview) { tests(appview); }
            });
        });
    }

);
