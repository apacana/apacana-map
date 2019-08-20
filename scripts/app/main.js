define(function (require) {
    let mapFns = require("./map");
    let mapBoxFns = require("./mapbox");
    let userFns = require("./user");

    let map = mapFns.getMap("map");  

    mapBoxFns.addGeoControl(map);
});
