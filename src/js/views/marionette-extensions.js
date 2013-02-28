define(["backbone", "marionette"], function(Backbone, Marionette) {

    _.extend(Marionette.View.prototype, {

        // Mix in template helper methods. Looks for a
        // `templateHelpers` in view options or as attribute, which can either be an
        // object literal, or a function that returns an object
        // literal. All methods and attributes from this object
        // are copies to the object passed in.
        mixinTemplateHelpers: function(target){
            target = target || {};
            var templateHelpers = this.options.templateHelpers ? this.options.templateHelpers : this.templateHelpers;
            if (_.isFunction(templateHelpers)){
                templateHelpers = templateHelpers.call(this);
            }
            return _.extend(target, templateHelpers);
        },
        // internal method to delegate DOM events and triggers
        _delegateDOMEvents: function(events){
            events = events || this.events;
            if (_.isFunction(events)){ events = events.call(this); }

            var combinedEvents  = {};
            var triggers        = this.configureTriggers();
            _.extend(combinedEvents, events, triggers);

            if (this.configureCustomEvents) {
                _.extend(combinedEvents, this.configureCustomEvents());
            }

            Backbone.View.prototype.delegateEvents.call(this, combinedEvents);
        },
        configureCustomEvents : function() {
            var timedEvents 	= this.configureTimedEvents();
            var timedTriggers 	= this.configureTimedTriggers();
            return _.extend({}, timedEvents, timedTriggers);
        },
        // Configure `timedEvents` to handle DOM events with a time interval protecting the
        // events from firing too close to each other.  This serves a solution for Android 4.1 firing
        // double touchstart, touchend and click events on tap.
        // `timedEvents: {"click .foo": "do:foo"}`
        configureTimedEvents: function(){
            if (!this.timedEvents) { return; }

            var that = this;
            var events = {};

            // Allow `triggers` to be configured as a function
            var timedEvents = _.result(this, "timedEvents");

            // Configure the triggers, prevent default
            // action and stop propagation of DOM events
            _.each(timedEvents, function(value, key){

                // build the event handler function for the DOM event
                events[key] = function(e){

                    // Resolve the method that handles the event (inline or in the view object)
                    var method = value;
                    if (!_.isFunction(method)) method = that[value];
                    if (!method) throw new Error('Method "' + value + '" does not exist');

                    // stop the event in its tracks
                    if (e && e.preventDefault){ e.preventDefault(); }
                    if (e && e.stopPropagation){ e.stopPropagation(); }

                    // If the event is too close to the previous time protected event, cancel it
                    var lastEventTime   = Marionette.View.lastEventTime,
                        currentTime     = Marionette.View.lastEventTime = e.timeStamp;
                    if ((currentTime - lastEventTime) < Marionette.View.eventInterval) {
                        console.log("last event:   " + currentTime - lastEventTime);
                        return;
                    }

                    // Invoke the method
                    method.call(that, e);
                };

            });

            return events;
        },
        // Configure `timedTriggers` to handle Marionette-style triggers with a time interval protecting the
        // events from firing too close to each other.  This serves a solution for Android 4.1 firing
        // double touchstart, touchend and click events on tap.
        // `timedTriggers: {"click .foo": "do:foo"}`
        configureTimedTriggers: function(){
            if (!this.timedTriggers) { return; }

            var that = this;
            var events = {};

            // Allow `triggers` to be configured as a function
            var timedTriggers = _.result(this, "timedTriggers");

            // Configure the triggers, prevent default
            // action and stop propagation of DOM events
            _.each(timedTriggers, function(value, key){

                // build the event handler function for the DOM event
                events[key] = function(e){

                    // stop the event in it's tracks
                    if (e && e.preventDefault){ e.preventDefault(); }
                    if (e && e.stopPropagation){ e.stopPropagation(); }

                    // If the event is too close to the previous time protected event, cancel it
                    var lastEventTime   = Marionette.View.lastEventTime,
                    currentTime     = Marionette.View.lastEventTime = e.timeStamp;
                    if ((currentTime - lastEventTime) < Marionette.View.eventInterval) {
                        console.log("last trigger: " + currentTime - lastEventTime);
                        return;
                    }

                    // build the args for the event
                    var args = {
                        view: this,
                        model: this.model,
                        collection: this.collection
                    };

                    // trigger the event
                    that.triggerMethod(value, args);
                };

            });

            return events;
        },

        // Override Marionette's "close" to enable not removing the DOM element
        // But just unbinding its events
        close: function(){
            if (this.isClosed) { return; }

            // allow the close to be stopped by returning `false`
            // from the `onBeforeClose` method
            var shouldClose = this.triggerMethod("before:close");
            if (shouldClose === false){
                return;
            }

            // mark as closed before doing the actual close, to
            // prevent infinite loops within "close" event handlers
            // that are trying to close other views
            this.isClosed = true;
            this.triggerMethod("close");

            // Allow the DOM node not to be removed but just unbound from events
            if (this.noRemove || this.options.noRemove) {
                this.$el.off()
            } else {
                this.remove();
            }
            this.stopListening();
        }
    });

    // Initialize the last event time to zero
    Marionette.View.lastEventTime = 0;

    // Define the minimum interval between two tap-induced click events.
    // This is the global interval and should serve all view objects.
    Marionette.View.eventInterval = 500;

});