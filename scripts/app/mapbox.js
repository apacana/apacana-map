pointPopupList = [];
markerFlag = false;
userMarkers = [];

let addGeoControl = function (mapBox, injects) {
    // 单例模式，利用 JS 的闭包特性，实现只有一个搜索标记移动
    let markerFlag = false;
    let otherMarkers = [0,0,0,0,0].map(() => {
        return L.marker([-360, -360], {
            icon: addIcon(mapBox)
        })
    });

    return function (map) {
        // 侵入 GeocoderControl 使其更符合要求
        injects.geoControl(function() {
            let control = mapBox.geocoderControl("mapbox.places", {
                keepOpen: true,
            });
            if (!markerFlag) {
                // 点击标记会使其移动到中心
                otherMarkers.forEach(item => {
                    item.on("click", function (e) {
                        map.panTo(e.target.getLatLng());
                    }).addTo(map);
                });

                markerFlag = true;
            }

            control.on("show", function ({ features }) {
                features.forEach((item, index) => {
                    // 只需移动搜索标记即可
                    let [lon, lat] = item.center;
                    console.log([lon, lat]);
                    otherMarkers[index].setLatLng([lat, lon]);
                    otherMarkers[index].bindPopup(
                        `
                            <p class="leaflet-info-window-name">${item.text}</p>
                            <p class="leaflet-info-window-address">${item.place_name}</p>
                            <div class="leaflet-info-window-btns">
                                <p class="leaflet-info-window-latlon">
                                    <i class="leaflet-info-window-icon icon-loc"></i>
                                    ${lat.toFixed(6)}, ${lon.toFixed(6)}
                                </p>
                                <a class="leaflet-info-window-btn" onclick="addPoint('${item.id}', '${item.escp_text}', '${item.escp_place_name}', '${item.center}');">
                                    <i class="leaflet-info-window-icon icon-add"></i>
                                    添加到点集
                                </>
                            </div>
                        `
                    );
                });
            });

            control.on("select", function ({ index }) {
                console.log(index);
                otherMarkers[index].openPopup();
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

let addPoint = function(point_id, text, place_name, center, point_type = 'search_point') {
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
        console.log(data)
        // todo: 数据存储展示
    }).catch(function(e) {
        console.log("addPoint error");
    });
};

setUserMarket = function (pointList) {
    userMarkers = [];
    for(let point of pointList) {
        let marker = L.marker([-360, -360], {icon: addIcon(L.mapbox)});
        marker.addTo(map);
        let [lon, lat] = point["center"].split(",");
        marker.setLatLng([lat, lon]);
        lat = parseFloat(lat);
        lon = parseFloat(lon);
        marker.bindPopup(
            `
                <p class="leaflet-info-window-name">${point["text"]}</p>
                <p class="leaflet-info-window-address">${point["place_name"]}</p>
                <div class="leaflet-info-window-btns">
                    <p class="leaflet-info-window-latlon">
                        <i class="leaflet-info-window-icon icon-loc"></i>
                        ${lat.toFixed(6)}, ${lon.toFixed(6)}
                    </p>
                    <a class="leaflet-info-window-btn">
                        <i class="leaflet-info-window-icon icon-add"></i>
                        已添加该点
                    </>
                </div>
                `
        );
        userMarkers.push(marker);
    }
};

define(function (require) {
    requestConfig = require("./request");
    // 加载 mapbox 的 token 
    let tokens = require("./token");
    L.mapbox.accessToken = tokens.mapbox;

    // 加载关于 mapbox 的侵入
    let mapboxInjects = require("./mapbox-inject/index");

    return { 
        addGeoControl: addGeoControl(L.mapbox, mapboxInjects)
    };
});
