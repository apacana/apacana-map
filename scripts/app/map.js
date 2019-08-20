let getMap = function(id) {    
    let map = L.map(id, {
        center: [39.908898,116.394293],
        zoom: 13,
        zoomControl: false
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
}

define(function (require) {
    require("leaflet-provider");

    return {
        getMap: getMap
    };
});
