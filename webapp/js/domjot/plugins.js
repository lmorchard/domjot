//
// ## domjot plugins
// 
define(
    ["underscore", "backbone", "domjot/utils", "require"],
    function (_, Backbone, utils, require) {
        var Plugins = {};

        var event_splitter = /^(\S+)\s*(.*)$/;

        // ### Plugin base class
        Plugins.Plugin = function (options) {
            this.options = _.extend({
                // TODO: defaults go here
            }, options);
            this.appview = this.options.appview;
            this.notes = this.options.notes;
            this.delegateEvents();
            this.initialize.apply(this, arguments);
        };
        _.extend(Plugins.Plugin, {
            // Steal the .extend() method from Backbone
            extend: Backbone.Model.extend
        });
        _.extend(Plugins.Plugin.prototype, Backbone.Events, {

            // #### Plugin initialization
            // Bind to events, here, from appview and friends
            initialize: function (options) { },

            events: {
                /*
                "appview all",
                "appview render",
                "appview enablecontrols",
                "appview linkclick",
                "appview newnote",
                "appview editor:close": "",
                "appview editor:delete": "",
                "appview editor:precommit": "",
                "appview editor:predelete": "",
                "appview editor:render": "",
                "appview editor:save": "",
                "appview editor:serialize": "",
                "appview linkclick": "",
                "appview newnote": "",
                "appview newnote:model": "",
                "appview note:enablecontrols": "",
                "appview note:hide": "",
                "appview note:hideothers": "",
                "appview note:render": "",
                "appview note:reveal": "",
                "appview note:revealeditor": "",

                "notes all": "",
                "notes add": "",
                "notes change": "",
                "notes change:body": "",
                "notes change:title": "",
                "notes destroy": "",
                "notes remove": ""
                */
            },

            delegateEvents: function (events) {
                if (!(events || (events = this.events))) return;
                if (_.isFunction(events)) events = events.call(this);
                for (var key in events) {
                    var match = key.match(event_splitter);
                    var source_name = match[1], 
                        event_name = match[2];

                    var source = this[source_name];
                    if (!source) throw new Error('Source "' + source_name + '" does not exist');
                    
                    var method = this[events[key]];
                    if (!method) throw new Error('Event "' + events[key] + '" does not exist');
                    method = _.bind(method, this);
                    
                    source.bind(event_name, method);
                }
            }

        });


        // ### Plugin registry class
        Plugins.Registry = function (options) {
            this.options = _.extend({
                // TODO: defaults go here
            }, options);
            this.initialize.apply(this, arguments);
        };
        _.extend(Plugins.Registry.prototype, Backbone.Events, {

            // #### Registered plugin classes
            plugin_classes: [],

            // #### Initialize the plugin registry
            initialize: function (options) { },

            // #### Register a plugin class
            register: function (plugin) {
                this.plugin_classes.push(plugin);
                return plugin;
            },
            
            // #### Create a collection of plugin instances
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
                }, options);

                var classes = this.options.registry.plugin_classes;

                for (var i=0; i<classes.length; i++) {
                    var cls = classes[i];
                    var obj = new cls(_.extend({
                        registry: $this.registry,
                        collection: $this
                    }, options));
                    this.plugins[i] = this.by_id[cls.id] = obj;
                }
            }

        });


        return Plugins;
    }
);
