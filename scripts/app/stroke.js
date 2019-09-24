// 留白
addFirstStroke = function (stroke_name = '') {
    fetch(requestConfig.domain + requestConfig.addStroke, {
        credentials: 'include',
        method: 'POST',
        body: '{"stroke_name": "' + stroke_name + '"}',
    }).then(response => {
        return response.json();
    }).then(data => {
        console.log(data);
        if (data.code !== 0) {
            console.log("addStroke failed, code:", data.code);
        } else {
            userInfoMem.strokes_info = {};
            userInfoMem.strokes_info.default_stroke = createStrokeVar(data.data["stroke_name"], data.data["stroke_token"], data.data["update_time"]);
            console.log(userInfoMem["strokes_info"]);
            let pane = bindStrokeInfo(userInfoMem["strokes_info"]);
            if (document.getElementById('featurelist-pane')) {
                document.getElementById('featurelist-pane').innerHTML = pane;
            } else {
                console.log("getElementById featurelist-pane failed");
            }
        }
    }).catch(function(e) {
        console.log("addStroke error");
    });
};

createStrokeVar = function (stroke_name, stroke_token, update_time, point_list = [], route_list = []) {
    let object = {};
    object.stroke_name = stroke_name;
    object.stroke_token = stroke_token;
    object.update_time = update_time;
    object.point_list = point_list;
    object.route_list = route_list;
    return object
};

let bindStrokeInfo = function(strokeList) {
    let pane;
    pane = `<div id="featurelist-titlebar-container">
                    <div id="featurelist-title-bar" class="featurelist-title-barClass">
                        <div id="map-action-menu" class="map-action-menuClass"></div>
                        <div id="map-title-desc-bar">
                            <div id="map-title-desc-bar-name" class="map-title-desc-bar-nameClass">${strokeList["default_stroke"]["stroke_name"]}</div>
                            <div id="map-title-desc-bar-time" class="map-title-desc-bar-timeClass">
                                <div>上次修改时间: ${strokeList["default_stroke"]["update_time"]}</div>
                            </div>
                        </div>
                        <ul class="map-actionClass">
                            <div style="height: 16px"></div>
                        </ul>
                    </div>
                </div>
                <div id="featurelist-scrollable-container" style="max-height: 625px; max-width: 307px; overflow-x: hidden; overflow-y: auto">
                    <div class="stroke-info">
                        <div class="point-list" style="position: relative">
                            <div class="point-list-layer">
                                <div class="point-list-layer-header">
                                    <div class="point-list-layer-header-font">行程点集</div>
                                </div>
                                <div class="point-list-layer-body">
                                    <div class="point-list-layer-body-container" id="point_list">`;

    // 点集合
    for(let point of strokeList["default_stroke"]["point_list"]) {
        pane += createPointHtml(point);
    }

    pane += `</div>
                                </div>
                            </div>
                        </div>
                        <div class="point-list" style="position: relative">
                            <div class="point-list-layer">
                                <div id="map-action-menu" class="" style="cursor: pointer;height: 21px; margin-right: 8px; opacity: .5; top: 12px; width: 21px;">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21" onclick="addRoute()">
                                            <path fill="none" d="M0 0h24v24H0z"/><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" fill="#000"/>
                                        </svg>
                                </div>
                                <div class="point-list-layer-header">
                                    <div class="point-list-layer-header-font">行程路线集</div>
                                </div>
                                <div class="point-list-layer-body">
                                    <div class="point-list-layer-body-container" id="route_list">`;

    // 路线集合
    for(let route of strokeList["default_stroke"]["route_list"]) {
        pane += createRouteHtml(route);
    }

    pane += `</div>
                                </div>
                            </div>
                        </div>
                        <ul class="map-actionClass">
                            <div style="height: 0"></div>
                        </ul>
                        <div class="point-list" style="position: relative">
                            <div class="point-list-layer">
                                <div class="point-list-layer-header">
                                    <div class="point-list-layer-header-font">历史行程</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
    return pane
};

createPointHtml = function (point) {
    pane = `<div class="point-list-layer-body-item">
                                            <div class="point-logo">
                                                <div class="point-logo-svg" style="background-position:center; background-size:contain;" iconcode="1899-0288D1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: #0052CC"><g>
                                                            <path fill="none" d="M0 0h24v24H0z"/>
                                                            <path d="M12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zm4.95-7.778a7 7 0 1 0-9.9 0L12 20.9l4.95-4.95zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
                                                        </g>
                                                    </svg>
                                                </div>
                                            </div>
                                            <div class="point-font-container">
                                                <div class="point-font" onclick="selectUserMarket('${point["point_id"]}', '${point["point_type"]}')">${point["text"]}</div>
                                            </div>
                                        </div>`;
    return pane;
};

createRouteHtml = function (route) {
    lastRoute = `route_item_${route["route_token"]}`;
    pane = `<div class="point-list-layer-body-item" id="route_item_${route["route_token"]}">
                                            <div class="point-logo">
                                                <div class="point-logo-svg" style="background-position:center; background-size:contain;" iconcode="1899-0288D1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21" style="fill: #0052CC">
                                                        <path fill="none" d="M0 0h24v24H0z"/>
                                                        <path d="M4 15V8.5a4.5 4.5 0 0 1 9 0v7a2.5 2.5 0 1 0 5 0V8.83a3.001 3.001 0 1 1 2 0v6.67a4.5 4.5 0 1 1-9 0v-7a2.5 2.5 0 0 0-5 0V15h3l-4 5-4-5h3zm15-8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="#0052CC"/>
                                                    </svg>
                                                </div>
                                            </div>
                                            <div class="point-font-container">
                                                <div class="point-font" id="" onclick="routeInfoClick('${route["route_token"]}')" style="">${route["route_name"]}</div>
                                            </div>
                                        </div>`;
    if (route.status === 1) {
        // @todo request route info
        pane += `            <div style="padding-left: 21px" id="route_info_list_${route["route_token"]}">   
                       <div class="point-list-layer-body-item">
                                            <div class="point-logo">
                                                <div class="point-logo-svg" style="background-position:center; background-size:contain;" iconcode="1899-0288D1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: #0052CC"><g>
                                                            <path fill="none" d="M0 0h24v24H0z"/>
                                                            <path d="M12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zm4.95-7.778a7 7 0 1 0-9.9 0L12 20.9l4.95-4.95zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
                                                        </g>
                                                    </svg>
                                                </div>
                                            </div>
                                            <div class="point-font-container">
                                                <div class="point-font" onclick="selectUserMarket('1', '2')">1122111111111111111111111111111111111133</div>
                                            </div>
                                        </div></div>    `;
        getRoute(route["route_token"]);
    }
    return pane
};

getDirection = function (start_lon, start_lat, end_lon, end_lat, profile = 'driving-traffic') {
    let url = requestConfig.mapBoxDomain + 'mapbox/' + profile + '/' + start_lon + '%2C' + start_lat + '%3B' + end_lon + '%2C' + end_lat + '.json?access_token=pk.eyJ1IjoiYWFyb25saWRtYW4iLCJhIjoiNTVucTd0TSJ9.wVh5WkYXWJSBgwnScLupiQ&geometries=geojson&overview=full';
    fetch(url, {
        method: 'GET',
    }).then(response => {
        return response.json();
    }).then(data => {
        console.log(data);
        if (data.code !== 'Ok') {
            console.log("getDirection failed, code:", data.code);
        } else {
            let coordinates = changeLonLat(data.routes[0].geometry.coordinates);

            // print to map
            let polyline = L.polyline(coordinates, {color: '#5eb0cc'});
            polyline.addTo(map);
        }
    }).catch(function(e) {
        console.log("getDirection error", e);
    });
};

changeLonLat = function(coordinates) {
    let newCoordinates = [];
    for(let item of coordinates) {
        newCoordinates.push([item[1], item[0]]);
    }
    return newCoordinates
};

addRoute = function (route_name = '') {
    fetch(requestConfig.domain + requestConfig.addRoute, {
        credentials: 'include',
        method: 'POST',
        body: '{"route_name": "' + route_name + '",' +
            '"stroke_token": "' + userInfoMem["strokes_info"]["default_stroke"]["stroke_token"] + '"}',
    }).then(response => {
        return response.json();
    }).then(data => {
        console.log(data);
        if (data.code !== 0) {
            console.log("addRoute failed, code:", data.code);
        } else {
            userInfoMem.strokes_info.default_stroke.route_list.push(data.data);
            userInfoMem.strokes_info.default_stroke.update_time = data.data["update_time"];
            console.log(userInfoMem.strokes_info.default_stroke.route_list);
            // 刷新route_list
            if (document.getElementById('route_list')) {
                let newNode = document.createElement("div");
                newNode.innerHTML = createRouteHtml(data.data);
                document.getElementById('route_list').insertBefore(newNode, null);
            } else {
                console.log("getElementById route_list failed");
            }
            // @todo 更新时间
        }
    }).catch(function(e) {
        console.log("addRoute error", e);
    });
};

routeInfoClick = function (route_token) {
    for (let route of userInfoMem.strokes_info.default_stroke.route_list) {
        if (route["route_token"] === route_token) {
            console.log(route);
            if (route["status"] === 0) {
                // @todo 关闭时点击：获取路径详细信息
                route["status"] = 1;
            } else if (route["status"] === 1) {
                // 打开时点击：关闭详细信息显示
                route["status"] = 0;
                closeRoute(route_token);
            }
            return
        }
    }
};

closeRoute = function (route_token) {
    // @todo 更新列表

    // 更新route status
    fetch(requestConfig.domain + requestConfig.closeRoute, {
        credentials: 'include',
        method: 'POST',
        body: '{"route_token": "' + route_token + '"}',
    }).then(response => {
        return response.json();
    }).then(data => {
        console.log(data);
        if (data.code !== 0) {
            console.log("closeRoute failed, code:", data.code);
        }
    }).catch(function(e) {
        console.log("closeRoute error");
    });
};

getRoute = function (route_token) {
    let url = requestConfig.domain + requestConfig.getRouteInfo + route_token + '/';
    fetch(url, {
        credentials: 'include',
        method: 'GET',
    }).then(response => {
        return response.json();
    }).then(data => {
        console.log(data);
        if (data.code !== 0) {
            console.log("getRouteInfo failed, code:", data.code);
        } else {
            updateRouteInfoList(data.data);
        }
    }).catch(function(e) {
        console.log("getRouteInfo error", e);
    });
};

updateRouteInfoList = async function (route_info) {
    while (mainPrint === true) {
        await sleep(500);
    }
    // print to route-info-list
    pane = "";
    for(let point of route_info["route_point"]) {
        pane += createPointHtml(point);
    }
    let id = `route_info_list_${route_info["route_token"]}`;
    if (document.getElementById(id)) {
        document.getElementById(id).innerHTML = pane;
    } else {
        console.log("getElementById failed");
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
