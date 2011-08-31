//
// ## domjot tests
//
require(["jquery", "domjot"], function ($, domjot) {
    QUnit.init();

    var coll = new domjot.models.NoteCollection();
    coll.bind("all", function (event_name) {
        console.log("COLL EVENT " + event_name);
    });

    test('DOM sections should appear as Notes in NoteCollection', function () {
        async.series([
            function (next) {
                stop();
                coll.fetch({
                    success: function () { next(); }
                });
            },
            function (next) {
                start();
                equals(coll.length, $('article > section').length,
                    "Collection should contain the same number of notes as sections");
                coll.each(function (note, idx) {
                    var section = $('article > section[id="'+note.id+'"]');
                    equals(section.length, 1,
                        "There should be a section matching "+note.id);
                    equals(note.get('title'), section.find('header > h2').text(),
                        "Note title should match section title");
                });
            }
        ]);
    });

    test('Creating Notes should result in new DOM sections', function () {

        var test_data = [
            { 'title': 'New Note 1',
                'body': '<p>First new one</p>' },
            { 'title': 'New Note 2',
                'body': '<p>Second new one</p>' },
            { 'title': 'New Note 3',
                'body': '<p>Third new one</p>' },
            { 'title': 'New Note 4',
                'body': '<p>Fourth new one</p>' }
        ];

        var new_notes = null;

        async.series([
            function (next) {
                stop(100);
                async.map(test_data, function (data, fe_next) {
                    coll.create(data, { 
                        success: function (model) {
                            fe_next(null, model); 
                        }
                    });
                }, function (err, results) { 
                    start();
                    new_notes = results;
                    next();
                });
            },
            function (next) {
                stop(100);
                coll.fetch({
                    success: function () { next(); }
                });
            },
            function (next) {
                start();
                for (var i=0,note; note=new_notes[i]; i++) {
                    var section = $('article > section[id="'+note.id+'"]');
                    equals(section.length, 1,
                        "There should be a section matching "+note.id);
                    equals(note.get('title'), section.find('header > h2').text(),
                        "Note title should match section title");
                }
            }
        ]);
    });

    QUnit.start();
});
