let injectGeoControl = function (require) {
    return function (fnc) {
        require(["./geoControl"], function () {
            fnc();
        });
    };
};

define(function (require) {
    return {
        geoControl: injectGeoControl(require) 
    }
});
