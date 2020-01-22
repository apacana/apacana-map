let getMap = function(id) {    
    let map = L.map(id, {
        // 天安门39.908898,116.394293
        // 华盛顿38.90378612315598,-77.04753807398001
        center: [39.908898,116.394293],
        zoom: 13,
        zoomControl: false,
        contextmenu: true,
        contextmenuWidth: 140,
        contextmenuItems: [{
            text: '清空搜索结果',
            callback: emptySearch
        }, '-', {
            text: '查询附近的酒店',
            callback: searchNearHotel
        }, {
            text: '清空酒店搜索结果',
            callback: emptyHotel
        }, '-', {
            text: '查询附近的餐厅',
            callback: searchNearFood
        }, {
            text: '清空餐厅搜索结果',
            callback: emptyFood
        }, '-', {
            text: '地图采点',
            callback: setMapPoint
        }, {
            text: '清空地图采点',
            callback: emptyMapPoint
        }]
    }).setMaxBounds([[-90, -180], [90, 180]]);

    // 显示谷歌地图
    L.tileLayer.mapProvider("Google.Normal.Map", {
        maxZoom: 18,
        minZoom: 3,
        attribution: 'Imagery © <a href="https://www.google.cn/maps">Google Map</a>'
    }).addTo(map);

    // 默认的位置在左上角，所以手动设置右下角
    L.control.zoom({
        zoomInTitle: "放大",
        zoomOutTitle: "缩小",
        position: "bottomright"
    }).addTo(map);

    return map;
};

emptySearch = function(e) {
    emptySearchResult(e);
    emptyFood(e);
    emptyMapPoint(e);
};

define(function (require) {
    require("leaflet-provider");
    require("leaflet-contextmenu");
    require("./hotel");
    require("./search_result");
    require("./map_point");
    require("./food");

    return {
        getMap: getMap
    };
});
