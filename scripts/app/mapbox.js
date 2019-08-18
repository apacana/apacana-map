let addGeoControl = function (mapBox, injects) {
    // 侵入 GeocoderControl 使其更符合要求
    injects.geoControl();

    return function (map) {
        let control = mapBox.geocoderControl("mapbox.places", {
            keepOpen: true
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
    }
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
