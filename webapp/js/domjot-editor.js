//
// ## domjot editor bootstrap loader
//
require({
    catchError: { 
        define: true 
    },
    baseUrl: 'webapp/js',
    priority: ['extlib/jquery', 'extlib/jQuery.twFile', 'extlib/underscore',
               'extlib/backbone', 'extlib/async']
}, function () {
    require(["domjot/views"], function (domjot_views) {
        require.ready(function () {
            window.appview = new domjot_views.AppView();
        });
    });
});
