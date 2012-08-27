define(["jquery", "backbone", "modalComponent"], function($, Backbone) {

    var ModalDialog = Backbone.View.extend({
        className : "modal-container",
        events : {
            "touchend .close"    : "close",
            "touchend .modal"    : "close",
            "touchend .buy-more" : "close",
            "touchend .cancel"   : "close"
        },
        close : function(event) {
            this.remove();

            // Decide which command to dispatch as an argument according to the
            // target element's class
            var target  = $(event.target),
                command = (target && target.hasClass("buy-more")) ? "buyMore" : "cancel";

            // Finally, notify observers that the dialog is closing and detach
            // any remaining event handlers.
            this.trigger("closed", command).off();

            return this;
        },
        initialize : function() {
            _.bindAll(this, "close");
        },
        template : Handlebars.templates["modal-component"],
        render : function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.options.parent.append(this.$el);
            return this;
        }
    });

    return {
        ModalDialog : ModalDialog
    };
});