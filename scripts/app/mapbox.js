markerFlag = false;
userMarkers = [];    // 行程点集下的点
userNameMarker = []; // 行程点集中的酒店下文字
userMarketIndex = 0;
searchMarkets = null;
popupOption = {
    autoPanPaddingTopLeft: L.point(350, 80),
    autoPanPaddingBottomRight: L.point(40, 100)
};
addRoutePointSwitch = false;
addRoutePointToken = '';
addRoutePointColor = '';

let initSearchMarket = function (mapBox) {
    searchMarkets = [0,0,0,0,0].map(() => {
        return L.marker([-360, -360], {
            icon: addIcon(mapBox)
        })
    });
};

let addGeoControl = function (mapBox, injects) {
    // 单例模式，利用 JS 的闭包特性，实现只有一个搜索标记移动
    let markerFlag = false;

    return function (map) {
        // 侵入 GeocoderControl 使其更符合要求
        injects.geoControl(function() {
            let control = mapBox.geocoderControl("mapbox.places", {
                keepOpen: true,
            });
            if (!markerFlag) {
                // 点击标记会使其移动到中心
                searchMarkets.forEach(item => {
                    item.on("click", function (e) {
                        map.panTo(e.target.getLatLng());
                    }).addTo(map);
                });

                markerFlag = true;
            }

            control.on("show", function ({ features }) {
                features.forEach((item, index) => {
                    // 去重
                    searchMarkets[index]["options"]["point_id"] = item.id;
                    searchMarkets[index]["options"]["point_type"] = "search_point";
                    if (!allowAddSearchMarket(item.id)) {
                        return true // continue
                    }
                    // 只需移动搜索标记即可
                    let [lon, lat] = item.center;
                    searchMarkets[index].setLatLng([lat, lon]);
                    searchMarkets[index]["options"]["text"] = item.text;
                    searchMarkets[index]["options"]["place_name"] = item.place_name;
                    searchMarkets[index]["options"]["lat"] = lat;
                    searchMarkets[index]["options"]["lon"] = lon;
                    searchMarkets[index].bindPopup(
                        `
                            <p class="leaflet-info-window-name">${item.text}</p>
                            <p class="leaflet-info-window-address">${item.place_name}</p>
                            <div class="leaflet-info-window-btns">
                                <p class="leaflet-info-window-latlon">
                                    <i class="leaflet-info-window-icon icon-loc"></i>
                                    ${lat.toFixed(6)}, ${lon.toFixed(6)}
                                </p>
                                <a class="leaflet-info-window-btn" style="cursor: pointer" onclick="addPoint('${index}', '${item.id}', '${item.escp_text}', '${item.escp_place_name}', '${item.center}');">
                                    <i class="leaflet-info-window-icon icon-add"></i>
                                    添加到点集
                                </>
                            </div>
                        `
                    );
                    searchMarkets[index].addTo(map);
                });
            });

            control.on("select", function ({ index }) {
                if (!allowAddSearchMarket(searchMarkets[index]["options"]["point_id"], searchMarkets[index]["options"]["point_type"])) {
                    selectUserMarket(searchMarkets[index]["options"]["point_id"], searchMarkets[index]["options"]["point_type"]);
                } else {
                    searchMarkets[index].openPopup();
                }
            });

            map.addControl(control);
       })
    };
};

let addIcon = function (mapBox, symbol = "circle", size = "medium", color = "#0052CC") {
    return mapBox.marker.icon({
        'mark-size': size,
        'marker-symbol': symbol,
        'marker-color': color
    });
};

let addPoint = function(index, point_id, text, place_name, center, point_type = 'search_point') {
    text = unescape(text);
    place_name = unescape(place_name);
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
            console.log("addPoint failed, code:", data.code);
        } else {
            searchMarketToUserMarket(index, data.data["point_info"]["point_token"]);
            // change feature list
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
            // console.log("userInfoMem[\"strokes_info\"][\"default_stroke\"]:",userInfoMem["strokes_info"]["default_stroke"]);
            // 刷新point_list
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
        console.log("addPoint error:", e);
    });
};

let packPointInfo = function(text, place_name, point_id, point_type, point_token, center, icon_type='', icon_color='', comment='', ext='') {
    let point = {};
    point.text = text;
    point.place_name = place_name;
    point.point_id = point_id;
    point.point_type = point_type;
    point.point_token = point_token;
    point.center = center;
    point.icon_type = icon_type;
    point.icon_color = icon_color;
    point.comment = comment;
    point.ext = ext;
    return point;
};

let searchMarketToUserMarket = function(index, point_token) {
    let market = searchMarkets[index];
    market.setPopupContent(userMarketPopup(market["options"]["text"], market["options"]["place_name"], market["options"]["lat"], market["options"]["lon"]), popupOption);

    let lat = parseFloat(market["options"]["lat"]);
    let lon = parseFloat(market["options"]["lon"]);
    let userMarker = L.marker([lat, lon], {index: userMarketIndex, icon: addIcon(L.mapbox), point_id: market["options"]["point_id"], point_type: "search_point", point_token: point_token, text: market["options"]["text"]});
    userMarker.addTo(map);
    userMarker.bindPopup(userMarketPopup(market["options"]["text"], market["options"]["place_name"], lat, lon), popupOption);
    userMarkers.push(userMarker);
    userMarketIndex += 1;
};

selectUserMarket = function(point_id, point_type) {
    for(let point of userMarkers) {
        if (point["options"]["point_id"] == point_id && point["options"]["point_type"] === point_type) {
            if (addRoutePointSwitch === true) {
                console.log("point:", point._latlng);
                addRoutePoint(addRoutePointToken, point, addRoutePointColor);
                removeRoutePointSelect(addRoutePointToken);
            }
            point.openPopup();
        }
    }
};

let allowAddSearchMarket = function(point_id, point_type = 'search_point') {
    for(let point of userMarkers) {
        if (point["options"]["point_id"] === point_id && point["options"]["point_type"] === point_type) {
            return false;
        }
    }
    return true;
};

setUserMarket = function (pointList) {
    userMarkers = [];
    hotelIDs = [];
    let nowTime = new Date();
    nowTime.setDate(nowTime.getDate() + 1);
    let checkInTime = nowTime.format("yyyy-MM-dd");
    nowTime.setDate(nowTime.getDate() + 1);
    let checkOutTime = nowTime.format("yyyy-MM-dd");
    for(let point of pointList) {
        let marker = L.marker([-360, -360], {index: userMarketIndex, icon: addIcon(L.mapbox), point_id: point["point_id"], point_type: point["point_type"], point_token: point["point_token"], text: point["text"]});
        marker.addTo(map);
        let [lon, lat] = point["center"].split(",");
        marker.setLatLng([lat, lon]);
        lat = parseFloat(lat);
        lon = parseFloat(lon);
        if (point["point_type"] === 'agoda_hotel') {
            hotelIDs.push(point["point_id"]);
            marker.setIcon(addIcon(L.mapbox, 'building'));
            let nameMarker = L.marker([lat, lon], {icon: textIcon(`${point["text"]} ¥???`), point_id: point["point_id"], point_type: "agoda_hotel", point_token: point["point_token"]});
            nameMarker.addTo(map);
            userNameMarker.push(nameMarker);
            searchHotelPrice(marker, checkInTime, checkOutTime, true);
            marker.bindPopup(userMarketPopup(point["text"], point["place_name"], lat, lon), hotelPopupOption);
        } else {
            marker.bindPopup(userMarketPopup(point["text"], point["place_name"], lat, lon), popupOption);
        }
        userMarkers.push(marker);
        userMarketIndex += 1;
    }
    if (hotelIDs.length > 0) {
        mGetHotelInfo(hotelIDs);
    }
};

userMarketPopup = function(text, place_name, lat, lon) {
  return `<p class="leaflet-info-window-name">${text}</p>
                <p class="leaflet-info-window-address">${place_name}</p>
                <div class="leaflet-info-window-btns">
                    <p class="leaflet-info-window-latlon">
                        <i class="leaflet-info-window-icon icon-loc"></i>
                        ${lat.toFixed(6)}, ${lon.toFixed(6)}
                    </p>
                    <a class="leaflet-info-window-btn">
                        <i class="leaflet-info-window-icon icon-add"></i>
                        已添加该点
                    </>
                </div>`
};

let mapMouseControl = function(mapBox) {
    return function (map) {
        // 单击事件
        map.on('click', function (e) {
            closeSearchResult();
            document.getElementById('featurelist-pane-hotel').innerHTML = '';
        });
        // 地图拖动事件
        map.on('dragstart', function (e) {
            // closeSearchResult();
        });
        // 地图拖动结束事件
        map.on('dragend', function (e) {
            // console.log(e.target._lastCenter, e.target._zoom)
        });
        // 地图缩放结束事件
        map.on('zoomend', function (e) {
            // console.log(e.target._lastCenter, e.target._zoom)
        });
        // 气泡点击事件
        map.on('popupopen', function(e) {
            let marker = e.popup._source;
            if (marker["options"]["point_type"] === 'agoda_hotel') {
                showHotelInfo(marker);
            }
        });
        // 气泡关闭事件
        map.on('popupclose', function(e) {
            document.getElementById('featurelist-pane-hotel').innerHTML = '';
        });
    }
};

closeSearchResult = function() {
    document.querySelector(".leaflet-control-mapbox-geocoder-results").classList.add("is-none");
};

define(function (require) {
    // 加载 mapbox 的 token
    let tokens = require("./token");
    L.mapbox.accessToken = tokens.mapbox;

    // 加载关于 mapbox 的侵入
    let mapboxInjects = require("./mapbox-inject/index");

    initSearchMarket(L.mapbox);

    return {
        addGeoControl: addGeoControl(L.mapbox, mapboxInjects),
        mapMouseControl: mapMouseControl(L.mapbox),
    };
});
