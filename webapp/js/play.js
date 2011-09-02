// domjot main bootstrap
require(["extlib/jquery", "domjot/controllers"], 
        function (i0, domjot_controllers) {
    var $ = jQuery;

    require.ready(function () {
        var controller = new domjot_controllers.MainController({
            article: $('article.domjot')
        });
        window.controller = controller;
    });
    
});
