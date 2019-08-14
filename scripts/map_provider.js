L.TileLayer.MapProvider = L.TileLayer.extend({
    initialize: function(type, options) { // (type, Object)
        var providers = L.TileLayer.MapProvider.providers;

        var parts = type.split('.');

        var providerName = parts[0];
        var mapName = parts[1];
        var mapType = parts[2];

        var url = providers[providerName][mapName][mapType];
        options.subdomains = providers[providerName].Subdomains;
        options.key = options.key || providers[providerName].key;
        L.TileLayer.prototype.initialize.call(this, url, options);
    }
});

L.TileLayer.MapProvider.providers  = {
    GaoDe: {
        Normal: {
            Map: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
        },
        Satellite: {
            Map: 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
            Annotion: 'https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}'
        },
        Subdomains: ["1", "2", "3", "4"]
    },

    Google: {
        Normal: {
            Map: "https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
        },
        Satellite: {
            Map: "https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}"
        },
        Subdomains: []
    },

    OpenStreet: {
        Normal: {
            Map: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
        },
        Subdomains: []
    }

};

L.tileLayer.mapProvider = function(type, options = {}) {
    return new L.TileLayer.MapProvider(type, options);
};
