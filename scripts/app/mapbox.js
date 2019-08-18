let addGeoControl = function (mapBox, injects) {
    // 侵入 GeocoderControl 使其更符合要求
    injects.geoControl();

    // 单例模式，利用 JS 的闭包特性，实现只有一个搜索标记移动
    let markerFlag = false;
    let searchMarker = L.marker([-360, -360], {
        icon: addIcon(mapBox)
    }); 

    return function (map) {
        let control = mapBox.geocoderControl("mapbox.places", {
            keepOpen: true
        });

        if (!markerFlag) {
            // 点击标记会使其移动到中心
            searchMarker.on("click", function (e) {
                map.panTo(e.target.getLatLng());
            });

            // 添加到地图上
            searchMarker.addTo(map);
            markerFlag = true;
        }

        control.on("select", function ({ feature }) {
            // 只需移动搜索标记即可
            let [lon, lat] = feature.center
            searchMarker.setLatLng([lat, lon]);
        });

        map.addControl(control);

        let controlInput = document
            .querySelector(".leaflet-control-mapbox-geocoder-form input");
        let controlToggle = document
            .querySelector(".leaflet-control-mapbox-geocoder-toggle");
            
        controlInput.addEventListener("focus", 
            function () {
                controlToggle.classList.add("is-active");
            });
        controlInput.addEventListener("blur",
            function () {
                controlToggle.classList.remove("is-active");
            });
    };
};

let addIcon = function (mapBox, symbol = "circle", size = "medium", color = "#0052CC") {
    return mapBox.marker.icon({
        'mark-size': size,
        'marker-symbol': symbol,
        'marker-color': color
    });
};

define(function (require) {
    // 加载 mapbox 的 token 
    let tokens = require("./token");
    L.mapbox.accessToken = tokens.mapbox;

    // 加载关于 mapbox 的侵入
    let mapboxInjects = require("./mapbox-inject/index");

    return { 
        addGeoControl: addGeoControl(L.mapbox, mapboxInjects)
    };
});
