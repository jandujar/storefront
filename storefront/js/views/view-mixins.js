define({
    wantsToLeaveStore : function() {
        this.nativeAPI.wantsToLeaveStore();
    },
    wantsToBuyVirtualGoods : function(model) {
        this.nativeAPI.wantsToBuyVirtualGoods(model.toJSON().itemId);
    },
    wantsToBuyMarketItem : function(model) {
        this.nativeAPI.wantsToBuyMarketItem(model.toJSON().productId);
    },
    wantsToEquipGoods : function(model) {
        this.nativeAPI.wantsToEquipGoods(model.toJSON().itemId);
    },
    wantsToUnequipGoods : function(model) {
        this.nativeAPI.wantsToUnequipGoods(model.toJSON().itemId);
    },
    requestEarnedCurrency : function(provider) {
        this.nativeAPI.requestEarnedCurrency(provider);
    },
    playSound :function() {
        this.nativeAPI.playPop();
        return this;
    }
});