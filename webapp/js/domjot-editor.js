//
// ## domjot editor bootstrap
//
require(
    
    { 
        catchError: { define: true }
    }, 
    
    ["domjot/views", "require"], 
    
    function (domjot_views, require) {
        require.ready(function () {
            window.appview = new domjot_views.AppView();
        });
    }

);
