define(function (require) {
    let tokens = require("./token");
    require("mapbox");

    // 加载 mapbox 的 token
    L.mapbox.accessToken = tokens.mapbox;

    return L.mapbox;
});
