//
// ## domjot models
//
define(["backbone", "underscore", "async",
        "domjot/utils"], 
        function (Backbone, _, async, Utils) {

    // ### Note model
    var BaseNote = Backbone.Model.extend({

        RE_WIKIWORD: /(^|\s|\b)(([A-Z][a-zA-Z0-9]+[A-Z][a-zA-Z0-9]+)+)(\s|\b|$)/g,
        RE_EXPLICIT: /\[\[(.*?)\]\]/g,
        RE_LINK:     /(<(a).*?<\/\2>)/g,

        // Replace pattern matches with placeholders, apply a filter callback,
        // then restore the placeholders with original matches.
        // Idea stolen from Markdown.
        hashMatches: function (s, pat, filter_cb) {
            var blocks = [];
            var hash = function (m, m1) {
                return "~L"+(blocks.push(m1)-1)+"L~";
            };
            var unhash = function (m, m1) {
                return blocks[m1];
            }
            return filter_cb(s.replace(pat, hash))
                .replace(/\~L(\d)L\~/g, unhash);
        },

        // Turn WikiWords and [[Explicit title links]] into HTML links.
        // Use hashMatches() to preserve pre-existing HTML links 
        linkifyWikiWords: function (s) {
            var $this = this;
            return this.hashMatches(s, this.RE_LINK, function (s) {
                return s
                    .replace($this.RE_WIKIWORD,
                        '$1<a href="#$2">$2</a>$4')
                    .replace($this.RE_EXPLICIT, function (m0, m1) {
                        return '<a href="#'+Utils.titleToID(m1)+'">'+m1+'</a>';
                    });
            });
        },

        // Filter note body for formatting.
        filterBody: function (body) {
            return this.linkifyWikiWords(body);
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
