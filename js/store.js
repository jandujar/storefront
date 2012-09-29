define(["jquery", "js-api", "native-api", "models", "components", "handlebars", "soomla-ios", "templates"], function($, jsAPI, NativeAPI, Models, Components, Handlebars, SoomlaIos) {

    // If pointing devices are enable (i.e. in the desktop generator \ mobile preview),
    // extend the views to capture their events.
    var addPointingDeviceEvents = function(target, events) {
        if (top.enablePointingDeviceEvents) _.extend(target, events);
    };
    addPointingDeviceEvents(Components.ListItemView.prototype.events, {click : "onSelect"});
    addPointingDeviceEvents(Components.ModalDialog.prototype.events, {
        "click .close"          : "close",
        "click .modal"          : "close"
    });

    $(function() {

        var recursiveThemeUpdate = function(obj) {
            _.each(obj, function(value, key) {
                if (_.isObject(value)) {
                    recursiveThemeUpdate(value);
                } else if (key == "template" && Handlebars.templates[value] && _.isFunction(Handlebars.templates[value])) {
                    obj[key] = Handlebars.templates[value];
                }
            });
        };

        window.SoomlaJS = _.extend({}, jsAPI, {
            // TODO: Refactor function
            newStore : function(json) {
                var attributes = {};
                if (json) {

                    if (json.theme)
                        attributes.theme = json.theme;

                    if (json.virtualGoods)
                        attributes.virtualGoods = json.virtualGoods;

                    if (json.virtualCurrencies)
                        attributes.virtualCurrencies = json.virtualCurrencies;

                    if (json.currencyPacks)
                        attributes.currencyPacks = json.currencyPacks;

                    if (json.isCurrencyStoreDisabled)
                        attributes.isCurrencyStoreDisabled = json.isCurrencyStoreDisabled;
                }

                this.store = new Models.Store(attributes);
            },
            // The native UI is loaded and the html needs to be rendered now
            initialize : function(json) {

                // Append appropriate stylesheet
                // TODO: render the store as a callback to the CSS load event
                var link = $("<link rel='stylesheet' href='themes/" + json.theme.name + "/" + json.theme.name + ".css'>");
                link.appendTo($("head"));

                // Initialize model
                this.newStore(json);
                var $this = this;

                require(["themes/" + json.theme.name + "/js/" + json.theme.name + "Views.js"], function(ThemeViews) {

                    // Add pointing device events
                    addPointingDeviceEvents(ThemeViews.StoreView.prototype.events, {
                        "click .leave-store"    : "wantsToLeaveStore",
                        "click .buy-more"       : "showCurrencyStore",
                        "click .back"           : "showGoodsStore"
                    });

                    // Initialize view
                    $this.storeView = new ThemeViews.StoreView({
                        model : $this.store,
                        el : $("#main"),
                        callbacks : json ? json.callbacks : {},
                        template : Handlebars.getTemplate("themes/" + json.theme.name + "/templates", "template")
                    }).render();

                    if (SoomlaNative && SoomlaNative.storeInitialized) SoomlaNative.storeInitialized();

                });

                return this.store;
            }
        });

        // Notify native code that we're initialized only if an interface exists
        // i.e. only when running in a device and not in the store builder.
        if (isMobile.iOS()){
            window.SoomlaNative = SoomlaIos;
        }

        var SoomlaNative = window.SoomlaNative;
        if (SoomlaNative && SoomlaNative.uiReady) {
            SoomlaNative.uiReady();
        }

    });
});