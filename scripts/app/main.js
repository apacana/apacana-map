define(function (require) {
    let mapFns = require("./map");
    let mapBoxFns = require("./mapbox");
    require("./heart");
    map = mapFns.getMap("map");

    require("./user");

    mapBoxFns.addGeoControl(map);
    mapBoxFns.mapMouseControl(map);
    heartBeat(map);

    // getDirection('-77.04753807398001', '38.90378612315598', '-77.02701979834258', '38.91768142447788')
    // searchHotelPrice(779240, '2019-10-19', '2019-10-20')
});
