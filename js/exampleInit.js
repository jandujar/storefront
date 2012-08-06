SoomlaJS.initialize({
    template : {
        name : "basic",
        elements : {
            title : {
                name : "The Surf Store"
            },
            buyMore : {
                text : "Buy more clams",
                image : "img/assets/clam.png"
            }
        }
    },
    background : "img/theme-lime-bubbles.jpg",
    currency : {
        name : "clams",
        image : "img/assets/clam.png",
        balance: 0
    },
    virtualGoods : [
        {
            name : "Rip Curl Shortboard",
            description : "Shred the small waves with this super-fast board",
            src : "img/surfboards/blue-surfboard.png",
            price : 100,
            productId : 2988822
        },
        {
            name : "Billanbog Vintage Longboard",
            description : "Slowly glide through low power surf and hang five",
            src : "img/surfboards/girl-surfboard-th.png",
            price : 150,
            productId : 2988823
        }
    ],
    currencyPacks : [
        {
            name : "Super Saver Pack",
            description : "For you cheap skates...",
            image : "coin.jpg",
            itemId : "super_saver_pack",
            marketItem : "super_saver_pack",
            price : 0.99,
            amount : 200
        },
        {
            name : "Malibu Medium Pack",
            description : "For you cheap skates...",
            image : "coin.jpg",
            itemId : "super_saver_pack",
            marketItem : "super_saver_pack",
            price : 1.99,
            amount : 500
        },
        {
            name : "Pipeline Pumpin' Pack",
            description : "The holy grail for ya spendin' surfers",
            image : "coin.jpg",
            itemId : "pipeline_pumpin_pack",
            marketItem : "pipeline_pumpin_pack",
            price : 5.99,
            amount : 1500
        }
    ]

});
