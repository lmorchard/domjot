//
// ## domjot plugins
// 
define(
    ["underscore", "backbone", "domjot/utils", "require"],
    function (_, Backbone, utils, require) {
        var Plugins = {};


        // ### Plugin base class
        Plugins.Plugin = function (options) {
            this.options = _.extend({
                // TODO: defaults go here
            }, options);
            this.initialize.apply(this, arguments);
        };
        _.extend(Plugins.Plugin, {
            // Steal the .extend() method from Backbone
            extend: Backbone.Model.extend
        })
        _.extend(Plugins.Plugin.prototype, Backbone.Events, {
            // #### Plugin initialization
            // Bind to events, here, from appview and friends
            initialize: function (options) { }
        });


        // ### Plugin registry class
        Plugins.Registry = function (options) {
            this.options = _.extend({
                // TODO: defaults go here
            }, options);
            this.initialize.apply(this, arguments);
        };
        _.extend(Plugins.Registry.prototype, Backbone.Events, {

            plugin_classes: [],

            initialize: function (options) { },
            
            register: function (plugin) {
                this.plugin_classes.push(plugin);
                return plugin;
            },
            
            createCollection: function (options) {
                return new Plugins.Collection(_.extend({ 
                    registry: this 
                }, options));
            }

        });


        // ### Shared plugin registry instance.
        Plugins.registry = new Plugins.Registry();


        // ### Collection of plugin instances
        Plugins.Collection = function (options) {
            this.options = _.extend({
                // TODO: defaults go here
            }, options);
            this.initialize.apply(this, arguments);
        };
        _.extend(Plugins.Collection.prototype, Backbone.Events, {

            plugins: [],
            by_id: {},

            initialize: function (options) {
                var $this = this;

                this.options = _.extend({
                    plugin_options: {}
                }, options);

                var classes = this.options.registry.plugin_classes,
                    plugin_options = this.options.plugin_options;

                for (var i=0; i<classes.length; i++) {
                    var cls = classes[i];
                    var obj = new cls(_.extend({
                        registry: $this.registry,
                        collection: $this
                    }, plugin_options));
                    this.plugins[i] = this.by_id[cls.id] = obj;
                }
            }

        });


        return Plugins;
    }
);
