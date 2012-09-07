define("generator.spec", ["models", "native-api", "components"], function (Models, NativeAPI, Components) {

    window.SoomlaNative = NativeAPI;

    var objectFromString = function(str, value) {
        var keys = str.split(".");
        var lastKey = keys.pop();
        var obj, temp;
        obj = temp = {};
        _.each(keys, function(key) { temp[key] = {}; temp = temp[key]; });
        temp[lastKey] = value;
        return obj;
    };

    describe('Soomla Store', function () {

        beforeEach(function() {
            delete SoomlaJS.store;
        });

        it('should be defined', function () {
            expect(SoomlaJS).toBeDefined();
        });

        it("should create a new store", function () {
            expect(SoomlaJS.store).toBeUndefined();
            SoomlaJS.newStore();
            expect(SoomlaJS.store).toBeDefined();
            expect(SoomlaJS.store).toBeInstanceOf(Models.Store);
        });

        it("should create a store with a background", function () {
            SoomlaJS.newStore({ background:"fish.png" });
            expect(SoomlaJS.store.get("background")).toEqual("fish.png");
        });

        it("should have a default empty list of virtual currencies", function () {
            expect(new Models.Store().get("virtualCurrencies")).toBeInstanceOf(Models.VirtualCurrencyCollection);
        });

        xit("should invoke storeInitialized when initializing a store", function () {
            var spy = sinon.spy(window.SoomlaNative, "storeInitialized");
            SoomlaJS.initialize({ template : {name : "empty"} });
            expect(spy.called).toBeTruthy();
            spy.restore();
        });


        describe('=== Currency', function () {

            var store
            beforeEach(function() {
                delete SoomlaJS.store;
                store = new Models.Store({virtualCurrencies : [{}]});
            });

            it("should have an empty array of currencies by default", function() {
                expect(new Models.Store().get("virtualCurrencies").toJSON()).toEqual([]);
            });

            it("should return itself after setting balances for chaining", function() {
                expect(store.setBalance({})).toEqual(store);
            });

            it("should set a new balance with the given amount", function() {
                var store = new Models.Store({virtualCurrencies : [{ itemId : "my_currency", balance : 0 }]});
                store.setBalance({my_currency : 100});
                expect(store.getBalance("my_currency")).toEqual(100);
            });

            it("should use coins as the default currency name", function () {
                expect(store.get("virtualCurrencies").at(0).get("name")).toEqual("coins");
            });

            it("should't have a default currency image", function() {
                expect(store.get("virtualCurrencies").at(0).get("image")).toBeUndefined();
            });

            it("should have 'store_currency' as the default currency itemId", function() {
                expect(store.get("virtualCurrencies").at(0).get("itemId")).toEqual("currency_coin");
            });

            it("should start with a balance of zero", function() {
                expect(store.get("virtualCurrencies").at(0).get("balance")).toEqual(0);
            });
        });

        describe('=== Background', function () {

            it("shouldn't have a background by default", function() {
                SoomlaJS.newStore();
                expect(SoomlaJS.store.get("background")).toBeUndefined();
            });

            xit("should fail to save when no background is supplied", function() {
                SoomlaJS.newStore();
                var spy = { errorStub : function(){} };
                spyOn(spy, "errorStub");
                SoomlaJS.store.on("error", spy.errorStub).set({background : ""});
                expect(spy.errorStub).toHaveBeenCalled();
            });

        });

        describe('=== Template', function () {

            beforeEach(function() {
                SoomlaJS.newStore();
            });

            it("should have a default name", function() {
                expect(SoomlaJS.store.get("templateName")).toEqual("basic");
            });

            it("should have a default title 'Store'", function() {
                expect(SoomlaJS.store.get("templateTitle")).toEqual("Store");
            });

            it("should have a default properties map", function() {
                expect(SoomlaJS.store.get("templateProperties")).toEqual({orientation : "horizontal"});
            });

            it("should have a default landscape orientation", function() {
                expect(SoomlaJS.store.get("orientationLanscape")).toEqual(false);
            });

            it("shouldn't have a title background by default", function() {
                expect(SoomlaJS.store.get("templateTitleBackgroundImage")).toBeUndefined();
            });

            it("should have a default 'more virtual currency' text", function() {
                expect(SoomlaJS.store.get("moreCurrencyText")).toEqual("Get more coins");
            });

            it("shouldn't have a 'more virtual currency' background by default", function() {
                expect(SoomlaJS.store.get("moreCurrencyBackgroundImage")).toBeUndefined();
            });
        });

        describe('=== Virtual Goods', function () {

            it("should have a default balance of 0", function() {
                expect(new Models.VirtualGood().get("balance")).toEqual(0);
            });

            it("should be consumable by default", function() {
                expect(new Models.VirtualGood().isConsumable()).toEqual(true);
            });

            it("should return itself after setting balances for chaining", function() {
                var store = new Models.Store();
                expect(store.updateVirtualGoods({})).toEqual(store);
            });

            it("should be found in a collection by 'itemId'", function() {
                var modelJSON = { itemId : 'sword' };
                var collection = new Models.VirtualGoodsCollection().add(new Models.VirtualGood(modelJSON));
                expect(collection.get("sword").toJSON()).toEqual(_.extend({}, Models.VirtualGood.prototype.defaults, modelJSON));
            });

            it("should have an empty virtual goods list by default", function() {
                SoomlaJS.newStore();
                expect(SoomlaJS.store.get("virtualGoods").toJSON()).toEqual([]);
            });

            it("should be able to add virtual goods to a nested collection", function() {
                SoomlaJS.newStore({ virtualGoods: [{ itemId : "surfboard" }] });
                expect(SoomlaJS.store.get("virtualGoods").length).toEqual(1);
                expect(SoomlaJS.store.get("virtualGoods").at(0)).toBeInstanceOf(Models.VirtualGood);
            });

            it("should increment the balance of a virtual good when it was purchased", function() {
                var store = new Models.Store({ virtualGoods: [{ itemId : "surfboard", balance : 1 }] });
                store.updateVirtualGoods({surfboard : {balance : 5}});
                expect(store.get("virtualGoods").get("surfboard").get("balance")).toEqual(5);
            });

            it("should update the price of a virtual good when an update call is recieved", function() {
                var store = new Models.Store({ virtualGoods: [{ itemId : "surfboard", balance : 1 }], virtualCurrencies : [{itemId : "currency_clam"}] });
                store.updateVirtualGoods({surfboard : {price : { "currency_clam" : 10 }}});
                var good = store.get("virtualGoods").get("surfboard");
                expect(good.get("price")).toEqual(10);
                expect(good.get("currency")).toEqual(store.get("virtualCurrencies").get("currency_clam").toJSON());
            });

            it("should use the first price for updating a virtual good when an update call is recieved with an array of prices", function() {
                var store = new Models.Store({ virtualGoods: [{ itemId : "surfboard", balance : 1 }], virtualCurrencies : [{itemId : "currency_clam"}, {itemId : "currency_dollar"}] });
                store.updateVirtualGoods({surfboard : {price : [{ "currency_dollar" : 100 }, { "currency_clam" : 10 }]}});
                var good = store.get("virtualGoods").get("surfboard");
                expect(good.get("price")).toEqual(100);
                expect(good.get("currency")).toEqual(store.get("virtualCurrencies").get("currency_dollar").toJSON());
            });

            // TODO: More tests on default field values and validation
        });

        describe('=== Currency Packs', function () {

            it("should have an empty currency pack list by default", function() {
                SoomlaJS.newStore();
                expect(SoomlaJS.store.get("currencyPacks").toJSON()).toEqual([]);
            });

            it("should be able to add currency packs to a nested collection", function() {
                SoomlaJS.newStore({
                    currencyPacks: [{
                        name : "Super Saver Pack",
                        description : "For you cheap skates...",
                        image : "coin.jpg",
                        itemId : "super_saver_pack",
                        marketItem : "super_saver_pack",
                        price : 2.99,
                        amount : 200
                    }]
                });
                expect(SoomlaJS.store.get("currencyPacks").length).toEqual(1);
                expect(SoomlaJS.store.get("currencyPacks").at(0)).toBeInstanceOf(Models.CurrencyPack);
            });

            // TODO: More tests on default field values and validation
        });

        describe('Input JSON parsing', function () {

            it("should initalize without a JSON argument", function() {
                SoomlaJS.newStore();
                expect(SoomlaJS.store).toBeDefined();
                expect(SoomlaJS.store).toBeInstanceOf(Models.Store);
            });

            it("should accept background", function() {
                SoomlaJS.newStore({ background : "fish.jpg" });
                expect(SoomlaJS.store.get("background")).toEqual("fish.jpg");
            });

            it("should accept nested template.name", function() {
                SoomlaJS.newStore({ template : { name : "basic"}});
                expect(SoomlaJS.store.get("templateName")).toEqual("basic");
            });

            it("should accept nested template.orientationLandscape", function() {
                SoomlaJS.newStore({ template : { orientationLandscape : true}});
                expect(SoomlaJS.store.get("orientationLandscape")).toEqual(true);
            });

            it("should accept nested template.elements.buyMore.text", function() {
                SoomlaJS.newStore(objectFromString("template.elements.buyMore.text", "Buy more clams"));
                expect(SoomlaJS.store.get("moreCurrencyText")).toEqual("Buy more clams");
            });

            it("should accept nested template.elements.buyMore.image", function() {
                SoomlaJS.newStore(objectFromString("template.elements.buyMore.imgFilePath", "img/assets/clam.png"));
                expect(SoomlaJS.store.get("moreCurrencyImage")).toEqual("img/assets/clam.png");
            });

            it("should accept nested isCurrencyStoreDisabled", function() {
                SoomlaJS.newStore({isCurrencyStoreDisabled : true});
                expect(SoomlaJS.store.get("isCurrencyStoreDisabled")).toEqual(true);
            });

            it("should accept nested template.elements.title.name", function() {
                SoomlaJS.newStore(objectFromString("template.elements.title.name", "Surf Shop"));
                expect(SoomlaJS.store.get("templateTitle")).toEqual("Surf Shop");
            });

            it("should accept nested template.elements.title.name", function() {
                var properties = {rows : 2, columns : 3};
                SoomlaJS.newStore(objectFromString("template.properties", properties));
                expect(SoomlaJS.store.get("templateProperties")).toEqual(properties);
            });

            it("should accept an array of virtual goods", function() {
                var virtualGood = {
                    name        : "Rip Curl Shortboard",
                    description : "Shred the small waves with this super-fast board",
                    image       : "img/boards/rip-curl.jpg",
                    price       : 100,
                    itemId      : 2988822
                };
                SoomlaJS.newStore({
                    virtualGoods : [virtualGood]
                });
                expect(SoomlaJS.store.get("virtualGoods").at(0).toJSON()).toEqual(_.extend({}, Models.VirtualGood.prototype.defaults, virtualGood));
                expect(SoomlaJS.store.get("virtualGoods").length).toEqual(1);
            });

            it("should accept an array of virtual currencies", function() {
                var virtualCurrency = {
                    name        : "Dollar",
                    description : "The best currency in the world",
                    image       : "img/coin.jpg",
                    itemId      : "currency_dollar"
                };
                SoomlaJS.newStore({
                    virtualCurrencies : [virtualCurrency]
                });
                expect(SoomlaJS.store.get("virtualCurrencies").get("currency_dollar").toJSON()).toEqual(_.extend({}, Models.Currency.prototype.defaults, virtualCurrency));
                expect(SoomlaJS.store.get("virtualCurrencies").length).toEqual(1);
            });

            // TODO: Be able to access SoomlaJS properties even though they are asynchronously set
            xit("should accept a 'beforeLeave' callback", function() {
                var callbacks = {
                    beforeLeave : function() {}
                };
                SoomlaJS.initialize({ callbacks : callbacks, template : {name : "empty"}, theme : {name : "empty"} });
                expect(SoomlaJS.storeView.options.callbacks.beforeLeave).toEqual(callbacks.beforeLeave);
            });

        });


        describe('=== Native / Javascript API', function () {

            it("should have Soomla Native API functions defined", function() {
                expect(SoomlaNative.wantsToBuyVirtualGoods).toBeDefined();
                expect(SoomlaNative.wantsToBuyCurrencyPacks).toBeDefined();
                expect(SoomlaNative.wantsToLeaveStore).toBeDefined();
            });

            it("should have Soomla Javascript API functions defined", function() {
                expect(SoomlaJS.disableCurrencyStore).toBeDefined();
                expect(SoomlaJS.currencyBalanceChanged).toBeDefined();
                expect(SoomlaJS.goodsUpdated).toBeDefined();
                expect(SoomlaJS.insufficientFunds).toBeDefined();
                expect(SoomlaJS.unexpectedError).toBeDefined();
                expect(SoomlaJS.destroy).toBeDefined();
            });

            it("should set the store balance when currency was purchased successfully", function() {
                SoomlaJS.newStore({virtualCurrencies: [{itemId : "dollar"}]});
                SoomlaJS.currencyBalanceChanged({dollar : 100});
                expect(SoomlaJS.store.getBalance("dollar")).toEqual(100);
            });

            it("should update a virtual good's balance when it is purchased successfully", function() {
                SoomlaJS.newStore({ currency : {balance : 0} , virtualGoods : [{itemId : "surfboard", balance : 0}]});
                SoomlaJS.goodsUpdated({surfboard : {balance : 1}});
                expect(SoomlaJS.store.get("virtualGoods").get("surfboard").get("balance")).toEqual(1);
            });

            it("shouldn't set the store balance when the currency purchase failed", function() {
                SoomlaJS.newStore();
                SoomlaJS.disableCurrencyStore();
                expect(SoomlaJS.store.get("isCurrencyStoreDisabled")).toEqual(true);
            });

            // TODO: Be able to access SoomlaJS properties even though they are asynchronously set
            xit("should open a dialog when there are insufficient funds", function() {
                var stub = sinon.stub(Components.ModalDialog.prototype, "render", function(){return this;});
                SoomlaJS.newStore();
                SoomlaJS.insufficientFunds();
                expect(stub.called).toBeTruthy();
                stub.restore();  // Restore original spied function to prototype
            });
        });

    });

});
