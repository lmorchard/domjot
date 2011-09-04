//
// ## domjot utils
//
define(function () {

    return {

        // #### Get a new unique ID for a note that isn't found in the document
        noteUID: function () {
            var id = '';
            do {
                id = _.uniqueId('note-');
            } while ($(id).length > 0);
            return id;
        },

        // #### Convert a title to an acceptable HTML ID
        titleToID: function (title) {
            return (''+title).replace(/^[^a-zA-Z]+/,'').replace(/[^\w]+/gi,'_');
        },

        // #### Common method to update DOM content from model object
        updateElementFromModel: function (el, model, dirty) {
            var data = model.toJSON(),
                name = this.titleToID(data.title);
            el.attr('id', model.id)
                .find('hgroup > h2 > a')
                    .text(data.title)
                    .attr('name', name)
                    .attr('href', '#'+name)
                .end()
                .find('div.body').html(data.body).end();
            if (dirty) {
                el.attr('data-dirty', 'true');
            }
        },

        // #### Common method to update plain object from DOM content
        extractDataFromElement: function (el, model) {
            var id = el.attr('id');
            if (!id) {
                id = this.noteUID();
                el.attr('id', id);
            }
            var item = {
                id: id,
                title: el.find('hgroup > h2').text().trim(),
                body: el.find('div.body').html()
            };
            return item;
        }

    };

});
