define(function (require) {
    let mapFns = require("./map");
    let mapBoxFns = require("./mapbox");

    map = mapFns.getMap("map");

    let userFns = require("./user");

    mapBoxFns.addGeoControl(map);
});
