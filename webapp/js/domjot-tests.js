// 
// ## domjot tests bootstrap
//
require(

    { 
        catchError: { define: true }
    },

    ["extlib/qunit", "domjot/views", "domjot/tests", "require"], 
    
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
