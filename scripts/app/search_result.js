
emptySearchResult = function (e) {
    document.getElementsByClassName("leaflet-control-mapbox-geocoder-input")[0]["value"] = "";
    document.getElementsByClassName("leaflet-control-mapbox-geocoder-results")[0].innerHTML = "";
    for (let market of searchMarkets) {
        market.removeFrom(map);
    }
};
