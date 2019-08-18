let injectGeoControl = function (require) {
    return function () {
        require(["./geoControl"], function () {
        });
    };
};

define(function (require) {
    return {
        geoControl: injectGeoControl(require) 
    }
});
