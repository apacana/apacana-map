let addGeoContorl = function (mapBox) {
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
    let tokens = require("./token");
    require("mapbox");

    // 加载 mapbox 的 token
    L.mapbox.accessToken = tokens.mapbox;

    return { 
        mapbox: L.mapbox, 
        addGeoContorl: addGeoContorl(L.mapbox)
    };
});
