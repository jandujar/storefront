define(["jquery", "backbone", "components", "cssUtils", "handlebars", "templates"], function($, Backbone, Components, CssUtils, Handlebars) {

    var HeaderView = Backbone.View.extend({
        initialize : function() {
            _.bindAll(this, "switchHeader");
            this.state = "menu";
        },
        events : {
            "click .back" : function() {
                this.trigger(this.state == "menu" ? "quit" : "back");
            }
        },
        switchHeader : function(titleImage, backImage) {
            this.$(".title-image").attr("src", titleImage);
            this.$(".back img").attr("src", backImage);
        }
    });


    var StoreView = Components.BaseStoreView.extend({
        initialize : function() {
            _.bindAll(this, "wantsToLeaveStore", "updateBalance",
                            "render", "openDialog",
                            "switchCategory", "showMenu",
                            "wantsToBuyVirtualGoods", "wantsToBuyCurrencyPacks");

            this.nativeAPI  = this.options.nativeAPI || window.SoomlaNative;
            this.theme      = this.model.get("theme");

            this.model.get("virtualCurrencies").on("change:balance", this.updateBalance);


            var virtualGoods    = this.model.get("virtualGoods"),
                currencyPacks   = this.model.get("currencyPacks"),
                categories      = new Backbone.Collection(this.model.get("categories")),
                templateHelpers = { images : this.theme.images },
                $this           = this;


            var VirtualGoodView = Components.ExpandableListItemView.extend({
                template        : Handlebars.getTemplate("themes/" + this.theme.name + "/templates", "item"),
                templateHelpers : templateHelpers,
                css             : { "background-image" : "url('" + this.theme.images.itemBackgroundImage + "')" }
            });
            var CurrencyPackView = Components.ExpandableListItemView.extend({
                template        : Handlebars.getTemplate("themes/" + this.theme.name + "/templates", "currencyPack"),
                templateHelpers : templateHelpers,
                css             : { "background-image" : "url('" + this.theme.images.itemBackgroundImage + "')" }
            });
            var CategoryView = Components.ListItemView.extend({ template : function(){} }); // empty template

            this.currencyPacksView = new Components.CollectionListView({
                className           : "items currencyPacks category",
                collection          : currencyPacks,
                itemView            : CurrencyPackView
            }).on("bought", this.wantsToBuyCurrencyPacks);



            this.pageViews = [];
            categories.each(function(category) {

                var categoryGoods = virtualGoods.filter(function(item) {return item.get("categoryId") == category.id});
                categoryGoods = new Backbone.Collection(categoryGoods);
                var categoryName = category.get("name");

                var view = new Components.CollectionListView({
                    className           : "items virtualGoods category " + categoryName,
                    category            : category,
                    collection          : categoryGoods,
                    itemView            : VirtualGoodView
                }).on("bought", $this.wantsToBuyVirtualGoods).on("equipped", $this.wantsToEquipGoods).on("unequipped", $this.wantsToUnequipGoods);

                $this.pageViews.push(view);
            });
            this.pageViews.push(this.currencyPacksView);

            categories.add({name : "currencyPacks"});
            this.categoryMenuView = new Components.CollectionListView({
                className           : "menu items clearfix",
                collection          : categories,
                itemView            : CategoryView
            }).on("selected", this.switchCategory);

            this.header = new HeaderView().on("back", this.showMenu).on("quit", this.wantsToLeaveStore);
        },
        switchCategory : function(model) {
            this.header.state = "category";
            var category = model.get("name");
            this.$(".menu").hide();
            this.$(".category").hide();
            this.$(".category." + category).show();
            this.header.switchHeader(this.theme.pages[category].title, this.theme.images.backImage);
        },
        showMenu : function() {
            this.header.state = "menu";
            this.$(".menu").show();
            this.$(".category").hide();
            this.header.switchHeader(this.theme.pages.menu.title, this.theme.images.quitImage);
        },
        updateBalance : function(model) {
            this.$(".balance-container label").html(model.get("balance"));
        },
        showCurrencyStore : function() {},
        showGoodsStore : function() {},
        openDialog : function(currency) {
            new Components.ModalDialog({
                parent : this.$el,
                model : this.theme.noFundsModal,
                template : Handlebars.getTemplate("themes/" + this.theme.name + "/templates", "modalDialog")
            }).render();
            return this;
        },
        onRender : function() {
            // Render child views (items in goods store and currency store)
            this.header.setElement(this.$(".header"));
            this.$(".pages").append(this.categoryMenuView.render().el);

            var $this = this;
            _.each(this.pageViews, function(view) {
                $this.$(".pages").append(view.render().el);
            });
        }
    });


    return {
        StoreView : StoreView
    };
});