// domjot main bootstrap
require(["jquery", "domjot"], function ($, domjot) {
    
    window.domjot = domjot;
    window.nc = new domjot.models.NoteCollection(); 
    nc.fetch();
    
});
