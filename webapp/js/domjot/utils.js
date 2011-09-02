//
// ## domjot utils
//
define(function () {

    return {

        // #### Common method to update DOM content from model object
        updateElementFromModel: function (el, model) {
            el.attr('id', model.id)
                .find('hgroup > h2').text(model.get('title')).end()
                .find('div.body').html(model.get('body')).end();
        },

        // #### Common method to update plain object from DOM content
        extractDataFromElement: function (el, model) {
            var id = el.attr('id');
            if (!id) {
                id = model.prototype.uid();
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
