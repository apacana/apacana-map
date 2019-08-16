define(function (require) {
    let mapFns = require("./map");
    let mapBox = require("./mapbox");

    let map = mapFns.getMap("map");  
    map.addControl(mapBox.geocoderControl("mapbox.places", {
        keepOpen: true
    }));
});
