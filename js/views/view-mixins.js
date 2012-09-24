define({
    wantsToBuyVirtualGoods : function(model) {
        this.nativeAPI.wantsToBuyVirtualGoods(model.toJSON().itemId);
    },
    wantsToBuyCurrencyPacks : function(model) {
        this.nativeAPI.wantsToBuyCurrencyPacks(model.toJSON().productId);
    },
    wantsToEquipGoods : function(model) {
        this.nativeAPI.wantsToEquipGoods(model.toJSON().productId);
    },
    wantsToUnequipGoods : function(model) {
        this.nativeAPI.wantsToUnequipGoods(model.toJSON().productId);
    },
    wantsToLeaveStore : function(event) {
        if (this.options.callbacks && this.options.callbacks.beforeLeave) this.options.callbacks.beforeLeave();
        event.preventDefault();

        // TODO: Release view bindings and destroy view
        this.nativeAPI.wantsToLeaveStore();
    }
});