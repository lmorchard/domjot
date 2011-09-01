// domjot main bootstrap
require(["jquery", "domjot"], function ($, domjot) {
    
    window.domjot = domjot;

    domjot.models.notes.fetch({
        success: function () {
            $('article.domjot > section').each(function () { 
                domjot.views.NoteView.get($(this)).enableControls(); 
            });
        }
    });
    
});
