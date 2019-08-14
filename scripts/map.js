(function() {
    let map = L.map("map", {
        center: [39.904983,116.427287],
        zoom: 13,
        zoomControl: false
    }).setMaxBounds([[-90, 0], [90, 360]]);

    // 显示谷歌地图
    L.tileLayer.mapProvider("Google.Normal.Map", {
        maxZoom: 18,
        attribution: 'Imagery © <a href="https://www.google.cn/maps">Google Map</a>'
    }).addTo(map);

    // 默认的位置在左上角，所以手动设置右下角
    L.control.zoom({
        zoomInTitle: "放大",
        zoomOutTitle: "缩小",
        position: "bottomright"
    }).addTo(map);

}())
