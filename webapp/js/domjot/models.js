//
// ## domjot models
//
define(["extlib/backbone", "extlib/underscore", "extlib/async",
        "domjot/utils"], 
        function (i1, i2, i3, utils) {

    // ### Note model
    var BaseNote = Backbone.Model.extend({

        RE_WIKIWORD_LINK: /(^|\b)(([A-Z][a-zA-Z0-9]+[A-Z][a-zA-Z0-9]+)+)($|\b)/g,
        RE_EXPLICIT_LINK: /\[\[(.*?)\]\]/g,

        filterBody: function (body) {
            body = ''+body;
            body = body.replace(this.RE_WIKIWORD_LINK, 
                '$1<a href="#$2">$2</a>$4');
            body = body.replace(this.RE_EXPLICIT_LINK, function () {
                return '<a href="#' + utils.titleToID(arguments[1]) + '">' + 
                    arguments[1] + '</a>';
            });
            return body;
        }

    });
            
    // ### Collection of domjot Notes
    var BaseNoteCollection = Backbone.Collection.extend({
        url: "notes",
        model: BaseNote,

        // See also: http://ui.thoughtbot.com/assets/backbone-js-on-rails-thoughtbot-ebook-august-2011-sample.html
        filtered: function(criteria_fn) {
            return new this.constructor(this.select(criteria_fn));
        }
    });

    return {
        BaseNote: BaseNote, 
        BaseNoteCollection: BaseNoteCollection
    };

});
