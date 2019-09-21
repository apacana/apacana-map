define(function (require) {
    let mapFns = require("./map");
    let mapBoxFns = require("./mapbox");
    map = mapFns.getMap("map");

    require("./user");

    mapBoxFns.addGeoControl(map);
    mapBoxFns.mapMouseControl(map);
});
