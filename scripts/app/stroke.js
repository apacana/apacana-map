checkBoxOpen = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21"><path fill="none" d="M0 0h24v24H0z"/><path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5zm6.003 11L6.76 11.757l1.414-1.414 2.829 2.829 5.656-5.657 1.415 1.414L11.003 16z" fill="#000"/></svg>`;
checkBoxClose = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21"><path fill="none" d="M0 0h24v24H0z"/><path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5z" fill="#000"/></svg>`;

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
                                <div id="stroke_update_time">上次修改时间: ${strokeList["default_stroke"]["update_time"]}</div>
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
                                <div id="map-action-menu" class="" style="cursor: pointer;height: 21px; margin-right: 8px; opacity: .5; top: 12px; width: 21px;" onclick="addRoute()">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21">
                                            <path fill="none" d="M0 0h24v24H0z"/><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" fill="#000"/>
                                        </svg>
                                </div>
                                <div class="point-list-layer-header" style="max-width: 250px;">
                                    <div class="point-list-layer-header-font">行程路线集</div>
                                </div>
                                <div class="point-list-layer-body" style="margin-left: 0">
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
    pane = `                            <div class="point-list-layer-body-item" id="route_item_${route["route_token"]}" style="padding-left: 25px;">
                                            <div id="route_check_box_${route["route_token"]}" class="" style="position: absolute; right: 0; cursor: pointer;height: 21px; margin-right: 250px; margin-top: 1px; margin-bottom: 2px; opacity: 0.8; top: 0; width: 21px;" onclick="routeInfoClick('${route["route_token"]}')">`;
    if (route.status === 1) {
        pane += checkBoxOpen;
    } else {
        pane += checkBoxClose;
    }
    pane += `</div>
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
                                        </div>
                                            <div style="padding-left: 46px" id="route_info_list_${route["route_token"]}"></div>`;
    if (route.status === 1) {
        // request route info
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
            // 更新时间
            updateStrokeUpdateTime(data.data["update_time"]);
        }
    }).catch(function(e) {
        console.log("addRoute error", e);
    });
};

updateStrokeUpdateTime = function (nowTime) {
    if (document.getElementById('stroke_update_time')) {
        document.getElementById('stroke_update_time').innerHTML = `上次修改时间: ${nowTime}`
    } else {
        console.log("getElementById failed");
    }
};

routeInfoClick = function (route_token) {
    for (let route of userInfoMem.strokes_info.default_stroke.route_list) {
        if (route["route_token"] === route_token) {
            console.log(route);
            if (route["status"] === 0) {
                // 关闭时点击：获取路径详细信息
                route["status"] = 1;
                openRoute(route_token);
            } else if (route["status"] === 1) {
                // 打开时点击：关闭详细信息显示
                route["status"] = 0;
                closeRoute(route_token);
            }
            return
        }
    }
};

openRoute = function (route_token) {
    if (typeof(routeInfoMap.get(route_token)) === 'undefined') {
    } else {
        let id = `route_info_list_${route_token}`;
        if (document.getElementById(id)) {
            document.getElementById(id).innerHTML = routeInfoMap.get(route_token);
        } else {
            console.log("getElementById failed");
        }
    }

    document.getElementById(`route_check_box_${route_token}`).innerHTML = checkBoxOpen;
    getRoute(route_token);
};

closeRoute = function (route_token) {
    // 更新列表
    let id = `route_info_list_${route_token}`;
    if (document.getElementById(id)) {
        document.getElementById(id).innerHTML = '';
    } else {
        console.log("getElementById failed");
    }
    document.getElementById(`route_check_box_${route_token}`).innerHTML = checkBoxClose;

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
    pane += addRoutePointLogo(route_info["route_token"]);
    routeInfoMap.set(route_info["route_token"], pane);
    let id = `route_info_list_${route_info["route_token"]}`;
    if (document.getElementById(id)) {
        document.getElementById(id).innerHTML = pane;
    } else {
        console.log("getElementById failed");
    }
};

addRoutePointLogo = function (route_token) {
    return `<div id="" style="cursor: pointer; font: 400 13px Roboto, Arial, sans-serif; color: #777777; width: 65px;" onclick="addRoutePointPrepare('${route_token}')">
                    <div>添加路线点</div>
            </div>`;
};

addRoutePointPrepare = function (route_token) {
    console.log("add route point", route_token)
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
