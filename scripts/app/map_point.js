
mapPointMarker = []; // 点marker集合
mapPointIndex = 0;   // 点index偏移量
mapPointPopupOption = {
    autoPanPaddingTopLeft: L.point(350, 80),
    autoPanPaddingBottomRight: L.point(40, 100),
};

setMapPoint = function (e) {
    console.log(e.latlng);
    geoCoding(e.latlng.lng, e.latlng.lat);
};

emptyMapPoint = function (e) {
    for (let point of mapPointMarker) {
        point.removeFrom(map);
    }
    mapPointMarker = [];
    mapPointIndex = 0;
};

mapPointMarketPopup = function(index, lat, lon, text = "地图采点", place = "") {
    return `<p class="leaflet-info-window-name">${text}</p>
                <p class="leaflet-info-window-address" style="cursor: pointer">${place}</p>
                <div class="leaflet-info-window-btns">
                    <p class="leaflet-info-window-latlon">
                        <i class="leaflet-info-window-icon icon-loc"></i>
                        ${lat.toFixed(6)}, ${lon.toFixed(6)}
                    </p>
                    <a class="leaflet-info-window-btn" style="cursor: pointer" onclick="addMapPoint('${index}', '${text}', '${place}', '${lat}', '${lon}');">
                        <i class="leaflet-info-window-icon icon-add"></i>
                            添加到点集
                    </>
                </div>`
};

mapPointMarkerToUserMarket = function(index, point_token) {
    let market = mapPointMarker[index];
    market.setPopupContent(userMarketPopup(market["options"]["text"], market["options"]["place_name"], market["options"]["lat"], market["options"]["lon"]), mapPointPopupOption);

    let lat = parseFloat(market["options"]["lat"]);
    let lon = parseFloat(market["options"]["lon"]);
    let userMarker = L.marker([lat, lon], {index: userMarketIndex, icon: addIcon(L.mapbox), point_id: market["options"]["point_id"], point_type: "search_point", point_token: point_token});
    userMarker.addTo(map);
    userMarker.bindPopup(userMarketPopup(market["options"]["text"], market["options"]["place_name"], lat, lon), mapPointPopupOption);
    userMarkers.push(userMarker);
    userMarketIndex += 1;
};

/* ============================================================http request============================================================ */

let addMapPoint = function(index, text, place_name, lat, lng, point_type = 'search_point') {
    text = unescape(text);
    place_name = unescape(place_name);
    let point_id = mapPointMarker[index]["options"]["point_id"];
    let center = lng + "," + lat;
    fetch(requestConfig.domain + requestConfig.addPoint, {
        credentials: 'include',
        method: 'POST',
        body: '{"point_id": "' + point_id + '",' +
            '"point_type": "' + point_type + '",' +
            '"text": "' + text + '",' +
            '"place_name": "' + place_name + '",' +
            '"center": "' + center + '"}',
    }).then(response => {
        return response.json();
    }).then(data => {
        console.log(data);
        if (data.code !== 0) {
            console.log("addMapPoint failed, code:", data.code);
        } else {
            mapPointMarkerToUserMarket(index, data.data["point_info"]["point_token"]);
            if (typeof(userInfoMem["strokes_info"]) == "undefined") {
                userInfoMem.strokes_info = {};
                userInfoMem.strokes_info.default_stroke = createStrokeVar(data.data["stroke_info"]["stroke_name"], data.data["stroke_info"]["stroke_token"], data.data["stroke_info"]["update_time"]);
                userInfoMem.strokes_info.default_stroke.point_list.push(packPointInfo(text, place_name, point_id, point_type, data.data["point_info"]["point_token"], center));
                let pane = bindStrokeInfo(userInfoMem.strokes_info);
                if (document.getElementById('featurelist-pane')) {
                    document.getElementById('featurelist-pane').innerHTML = pane;
                } else {
                    console.log("getElementById featurelist-pane failed");
                }
                return
            }
            userInfoMem.strokes_info.default_stroke.update_time = data.data["stroke_info"]["update_time"];
            userInfoMem.strokes_info.default_stroke.point_list.push(packPointInfo(text, place_name, point_id, point_type, data.data["point_info"]["point_token"], center));
            if (document.getElementById('point_list')) {
                let newNode = document.createElement("div");
                newNode.innerHTML = createPointHtml(data.data["point_info"]);
                document.getElementById('point_list').insertBefore(newNode, null);
            } else {
                console.log("getElementById point_list failed");
            }
            updateStrokeUpdateTime(data.data["stroke_info"]["update_time"]);
        }
    }).catch(function(e) {
        console.log("addMapPoint error:", e);
    });
};

geoCoding = function (longitude, latitude) {
    let url = requestConfig.mapBoxGeocodingDomain + 'mapbox.places/' + longitude + ',' + latitude + '.json?access_token=pk.eyJ1IjoiYWFyb25saWRtYW4iLCJhIjoiNTVucTd0TSJ9.wVh5WkYXWJSBgwnScLupiQ';
    fetch(url, {
        method: 'GET',
    }).then(response => {
        return response.json();
    }).then(data => {
        if (typeof(data["features"]) !== "undefined") {
            if (data["features"].length > 0) {
                console.log(data["features"][0]);
                // 去重
                let point_id = data["features"][0]["id"];
                for (let market of userMarkers) {
                    if (market["options"]["point_id"] === point_id) {
                        console.log("userMarkers 去重");
                        return;
                    }
                }
                for (let market of mapPointMarker) {
                    if (market["options"]["point_id"] === point_id) {
                        console.log("mapPointMarker 去重");
                        return;
                    }
                }

                // 显示
                let lat = data["features"][0]["center"][1];
                let lng = data["features"][0]["center"][0];
                let marker = L.marker([-360, -360], {icon: addIcon(L.mapbox), index: mapPointIndex, point_id: point_id, point_type: "search_point",lat: lat, lon: lng, place_name: data["features"][0]["place_name"], text: data["features"][0]["text"]});
                marker.addTo(map);
                marker.setLatLng([lat, lng]);
                marker.bindPopup(mapPointMarketPopup(mapPointIndex, lat, lng, data["features"][0]["text"], data["features"][0]["place_name"]), mapPointPopupOption);
                mapPointMarker.push(marker);
                mapPointIndex += 1;
            }
        }
    }).catch(function(e) {
        console.log("geoCoding error", e);
    });
};
