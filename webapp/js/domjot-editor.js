//
// ## domjot editor bootstrap
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
    
    ["domjot/views", "require"], 
    
    function (domjot_views, require) {
        require.ready(function () {
            window.appview = new domjot_views.AppView();
        });
    }

);
