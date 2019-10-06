checkBoxOpen = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21"><path fill="none" d="M0 0h24v24H0z"/><path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5zm6.003 11L6.76 11.757l1.414-1.414 2.829 2.829 5.656-5.657 1.415 1.414L11.003 16z" fill="#000"/></svg>`;
checkBoxClose = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21"><path fill="none" d="M0 0h24v24H0z"/><path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5z" fill="#000"/></svg>`;
routePointMap = new Map();
routeColorMap = new Map();
routePointMapMutex = false;
routeDirectionMap = new Map();
changeStrokeNameMutex = false;
changeRouteNameMutex = new Map();

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

changeStrokeNameKeyUp = function (event) {
    if(event.keyCode === 13) {
        changeStrokeNameMutex = true;
        changeStrokeNameOnBlur('changeStrokeNameKeyUp');
    }
};

changeStrokeName = function () {
    let strokeName = document.getElementById('map-title-desc-bar-name-span').innerHTML;
    document.getElementById('map-title-desc-bar-name').innerHTML = `<input type='text' id="new-default-stroke-name" value='${strokeName}' onBlur="changeStrokeNameOnBlur('source')" onfocus="this.select()" onmouseover="this.select()" onkeyup="changeStrokeNameKeyUp(event);" autofocus=true style="height: 13px; font-size: 9px; padding: 0" />`;
};

updateStrokeName = function (stroke_name) {
    document.getElementById('map-title-desc-bar-name').innerHTML = `<span id="map-title-desc-bar-name-span" style="cursor: pointer" onclick="changeStrokeName()">${stroke_name}</span>`
};

updateStrokeRequire = function (stroke_token, stroke_name, old_name) {
    fetch(requestConfig.domain + requestConfig.updateStroke, {
        credentials: 'include',
        method: 'POST',
        body: '{"stroke_name": "' + stroke_name + '",' +
            '"stroke_token": "' + stroke_token + '"}',
    }).then(response => {
        return response.json();
    }).then(data => {
        console.log(data);
        if (data.code !== 0) {
            console.log("updateStroke failed, code:", data.code);
            updateStrokeName(old_name);
        } else {
            updateStrokeUpdateTime(data.data["update_time"]);
            updateStrokeName(stroke_name);
            userInfoMem["strokes_info"]["default_stroke"]["stroke_name"] = stroke_name;
        }
    }).catch(function(e) {
        console.log("updateStroke error", e);
    });
};

changeStrokeNameOnBlur = function (source) {
    if (source === 'source' && changeStrokeNameMutex === true) {
        changeStrokeNameMutex = false;
        return;
    }
    let newStrokeName = document.getElementById(`new-default-stroke-name`).value;
    if (userInfoMem["strokes_info"]["default_stroke"]["stroke_name"] !== newStrokeName) {
        updateStrokeRequire(userInfoMem["strokes_info"]["default_stroke"]["stroke_token"], newStrokeName, userInfoMem["strokes_info"]["default_stroke"]["stroke_name"]);
    } else {
        updateStrokeName(newStrokeName);
    }
};

let bindStrokeInfo = function(strokeList) {
    let pane;
    let size = getClientSize();
    pane = `<div id="featurelist-titlebar-container">
                    <div id="featurelist-title-bar" class="featurelist-title-barClass">
                        <div id="map-action-menu" class="map-action-menuClass"></div>
                        <div id="map-title-desc-bar">
                            <div id="map-title-desc-bar-name" class="map-title-desc-bar-nameClass" style="height: 18px;"><span id="map-title-desc-bar-name-span" style="cursor: pointer" onclick="changeStrokeName()">${strokeList["default_stroke"]["stroke_name"]}</span></div>
                            <div id="map-title-desc-bar-time" class="map-title-desc-bar-timeClass">
                                <div id="stroke_update_time">上次修改时间: ${strokeList["default_stroke"]["update_time"]}</div>
                            </div>
                        </div>
                        <ul class="map-actionClass">
                            <div style="height: 16px"></div>
                        </ul>
                    </div>
                </div>
                <div id="featurelist-scrollable-container" style="max-height: ${size.height - 184}px; max-width: 307px; overflow-x: hidden; overflow-y: auto">
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
    let pane = `<div class="point-list-layer-body-item">
                                            <div class="point-logo">
                                                <div class="point-logo-svg" style="background-position:center; background-size:contain;" iconcode="1899-0288D1">`;
    if (point["point_type"] === 'agoda_hotel') {
        pane += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21" style="fill: #0052CC"><path fill="none" d="M0 0h24v24H0z"/><path d="M22 21H2v-2h1V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v5h2v10h1v2zm-5-2h2v-8h-6v8h2v-6h2v6zm0-10V5H5v14h6V9h6zM7 11h2v2H7v-2zm0 4h2v2H7v-2zm0-8h2v2H7V7z" fill="#0052CC"/></svg>`;
    } else {
        pane += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21" style="fill: #0052CC"><g>
                                                            <path fill="none" d="M0 0h24v24H0z"/>
                                                            <path d="M12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zm4.95-7.778a7 7 0 1 0-9.9 0L12 20.9l4.95-4.95zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
                                                        </g>
                                                    </svg>`;
    }
    pane += `</div>
                                            </div>
                                            <div class="point-font-container">
                                                <div class="point-font" onclick="selectUserMarket('${point["point_id"]}', '${point["point_type"]}')">${point["text"]}</div>
                                            </div>
                                        </div>`;
    return pane;
};

changeRouteNameKeyUp = function (event, route_token) {
    if(event.keyCode === 13) {
        changeRouteNameMutex.set(route_token, true);
        changeRouteNameOnBlur('changeRouteNameKeyUp', route_token);
    }
};

changeRouteNameOnBlur = function (source, route_token) {
    let mutex = changeRouteNameMutex.get(route_token);
    if (source === 'source' && typeof(mutex) !== 'undefined' && mutex === true) {
        changeRouteNameMutex.set(route_token, false);
        return;
    }
    let newRouteName = document.getElementById(`new-route-name${route_token}`).value;
    let routeName = '';
    for (let route of userInfoMem["strokes_info"]["default_stroke"]["route_list"]) {
        if (route["route_token"] === route_token) {
            routeName = route["route_name"];
            break;
        }
    }
    if (routeName !== newRouteName) {
        updateRouteRequire(route_token, newRouteName, routeName);
    } else {
        updateRouteName(route_token, newRouteName);
    }
};

updateRouteRequire = function (route_token, route_name, old_name) {
    fetch(requestConfig.domain + requestConfig.updateRoute, {
        credentials: 'include',
        method: 'POST',
        body: '{"route_token": "' + route_token + '",' +
            '"route_name": "' + route_name + '"}',
    }).then(response => {
        return response.json();
    }).then(data => {
        console.log(data);
        if (data.code !== 0) {
            console.log("updateRoute failed, code:", data.code);
            updateRouteName(route_token, old_name);
        } else {
            updateStrokeUpdateTime(data.data["update_time"]);
            updateRouteName(route_token, route_name);
            for (let route of userInfoMem["strokes_info"]["default_stroke"]["route_list"]) {
                if (route["route_token"] === route_token) {
                    route["route_name"] = route_name;
                    break;
                }
            }
        }
    }).catch(function(e) {
        console.log("updateRoute error", e);
    });
};


updateRouteName = function (route_token, route_name) {
    document.getElementById(`route-name${route_token}`).innerHTML = `<span id="route-name${route_token}-span" style="cursor: pointer" onclick="changeRouteName('${route_token}')">${route_name}</span>`
};

changeRouteName = function (route_token) {
    let routeName = document.getElementById(`route-name${route_token}-span`).innerHTML;
    document.getElementById(`route-name${route_token}`).innerHTML = `<input type='text' id="new-route-name${route_token}" value='${routeName}' onBlur="changeRouteNameOnBlur('source', '${route_token}')" onfocus="this.select()" onmouseover="this.select()" onkeyup="changeRouteNameKeyUp(event, '${route_token}');" autofocus=true style="height: 13px; font-size: 9px; padding: 0" />`;
};

createRouteHtml = function (route) {
    lastRoute = `route_item_${route["route_token"]}`;
    let pane = `                            <div class="point-list-layer-body-item" id="route_item_${route["route_token"]}" style="padding-left: 25px;">
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
                                                <div class="point-font" id="route-name${route["route_token"]}" style=""><span id="route-name${route["route_token"]}-span" style="cursor: pointer" onclick="changeRouteName('${route["route_token"]}')">${route["route_name"]}</span></div>
                                            </div>
                                        </div>
                                            <div style="padding-left: 46px" id="route_info_list_${route["route_token"]}"></div>`;
    if (route.status === 1) {
        // request route info
        getRoute(route["route_token"]);
    }
    return pane
};

getDirection = function (index, start_lon, start_lat, end_lon, end_lat, route_token, point_token, route_color, profile = 'driving-traffic') {
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
            let direction = '';
            if (data.routes.length > 0) {
                let coordinates = changeLonLat(data.routes[0].geometry.coordinates);

                // print to map
                let polyline = L.polyline(coordinates, {color: route_color}); // 5eb0cc
                polyline.addTo(map);
                addPolylineCache(route_token, polyline);
                direction = JSON.stringify(data.routes[0]);
                routePointMapAddDirection(index, route_token, direction, route_color)
            }
            addRoutePointRequest(route_token, point_token, direction);
        }
    }).catch(function(e) {
        console.log("getDirection error", e);
    });
};

routePointMapAddDirection = async function(index, route_token, direction, route_color) {
    while (routePointMapMutex === true) {
        await sleep(500);
    }
    routePointMapMutex = true;
    let routePoint = routePointMap.get(route_token);
    routePoint[index]["direction"] = direction;

    let pane = "";
    let newIndex = 0;
    for(let point of routePoint) {
        if (point["direction"] !== '') {
            let direction = JSON.parse(point["direction"]);
            pane += createDirectionHtml(route_token, newIndex, direction, route_color, point["direction_type"]);
        }
        pane += createPointHtml(point);
        newIndex += 1;
    }
    pane += addRoutePointLogo(route_token, route_color);
    let id = `route_info_list_${route_token}`;
    if (document.getElementById(id)) {
        document.getElementById(id).innerHTML = pane;
    } else {
        console.log("getElementById failed");
    }
    routeInfoMap.set(route_token, pane);
    routePointMap.set(route_token, routePoint);
    routePointMapMutex = false;
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
        getRoute(route_token);
    } else {
        let id = `route_info_list_${route_token}`;
        if (document.getElementById(id)) {
            document.getElementById(id).innerHTML = routeInfoMap.get(route_token);
        } else {
            console.log("getElementById failed");
        }
        // load polyline
        if (typeof(routeDirectionMap.get(route_token)) === 'undefined') {
        } else {
            let polylineList = routeDirectionMap.get(route_token);
            for (let polyline of polylineList) {
                polyline.addTo(map);
            }
        }
    }

    document.getElementById(`route_check_box_${route_token}`).innerHTML = checkBoxOpen;
    // make close route request
    makeOpenRouteRequest(route_token);
};

makeOpenRouteRequest = function (route_token) {
    fetch(requestConfig.domain + requestConfig.openRoute, {
        credentials: 'include',
        method: 'POST',
        body: '{"route_token": "' + route_token + '"}',
    }).then(response => {
        return response.json();
    }).then(data => {
        console.log(data);
        if (data.code !== 0) {
            console.log("makeOpenRoute failed, code:", data.code);
        }
    }).catch(function(e) {
        console.log("makeOpenRoute error");
    });
};

closeRoute = function (route_token) {
    // 更新列表
    let id = `route_info_list_${route_token}`;
    if (document.getElementById(id)) {
        document.getElementById(id).innerHTML = '';
    } else {
        console.log("getElementById failed");
    }
    // remove polyline
    if (typeof(routeDirectionMap.get(route_token)) === 'undefined') {
    } else {
        let polylineList = routeDirectionMap.get(route_token);
        for (let polyline of polylineList) {
            polyline.removeFrom(map);
        }
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

choseDirectionType = function (index, now, other) {
    let pane = `${unescape(now)}${unescape(other)}`;
    pane += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="11" height="11" style="padding-bottom: 5px; cursor: pointer" onclick="closeDirectionType('${index}', '${now}', '${other}')"><path fill="none" d="M0 0h24v24H0z"/><path d="M10.828 12l4.95 4.95-1.414 1.414L8 12l6.364-6.364 1.414 1.414z" fill="#000"/></svg>`;
    document.getElementById(`direction-logo-${index}`).innerHTML = pane;
};

closeDirectionType = function (index, now, other) {
    let pane = `${unescape(now)}`;
    pane += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="11" height="11" style="padding-bottom: 5px; cursor: pointer" onclick="choseDirectionType('${index}', '${now}', '${other}')"><path fill="none" d="M0 0h24v24H0z"/><path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" fill="#000"/></svg>`;
    document.getElementById(`direction-logo-${index}`).innerHTML = pane;
};

createDirectionHtml = function (route_token, index, direction, color, direction_type = 'driving-traffic') {
    let other = ``;
    let now = ``;
    let driving = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21"><path fill="none" d="M0 0h24v24H0z"/><path d="M19 20H5v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V11l2.48-5.788A2 2 0 0 1 6.32 4H17.68a2 2 0 0 1 1.838 1.212L22 11v10a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1zm1-7H4v5h16v-5zM4.176 11h15.648l-2.143-5H6.32l-2.143 5zM6.5 17a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm11 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="#0052CC"/></svg>`;
    let walking = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21"><path fill="none" d="M0 0h24v24H0z"/><path d="M7.617 8.712l3.205-2.328A1.995 1.995 0 0 1 12.065 6a2.616 2.616 0 0 1 2.427 1.82c.186.583.356.977.51 1.182A4.992 4.992 0 0 0 19 11v2a6.986 6.986 0 0 1-5.402-2.547l-.697 3.955 2.061 1.73 2.223 6.108-1.88.684-2.04-5.604-3.39-2.845a2 2 0 0 1-.713-1.904l.509-2.885-.677.492-2.127 2.928-1.618-1.176L7.6 8.7l.017.012zM13.5 5.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-2.972 13.181l-3.214 3.83-1.532-1.285 2.976-3.546.746-2.18 1.791 1.5-.767 1.681z" fill="#0052CC"/></svg>`;
    let cycling = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21"><path fill="none" d="M0 0h24v24H0z"/><path d="M5.5 21a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm13 2a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-7.477-8.695L13 12v6h-2v-5l-2.719-2.266A2 2 0 0 1 8 7.671l2.828-2.828a2 2 0 0 1 2.829 0l1.414 1.414a6.969 6.969 0 0 0 3.917 1.975l-.01 2.015a8.962 8.962 0 0 1-5.321-2.575l-2.634 2.633zM16 5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="#0052CC"/></svg>`;
    let traffic = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 20H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1H3v-8H2V8h1V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3h1v4h-1v8h-1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1zm2-8V5H5v7h14zm0 2H5v4h14v-4zM6 15h4v2H6v-2zm8 0h4v2h-4v-2z" fill="#0052CC"/></svg>`;

    if (direction_type === 'driving') {
        now = driving;
        other = `<div style="position: relative; display: inline-block; cursor: pointer" onclick="changeDirection('${route_token}', '${index}', 'walking')">${walking}</div>
                 <div style="position: relative; display: inline-block; cursor: pointer" onclick="changeDirection('${route_token}', '${index}', 'cycling')">${cycling}</div>
                 <div style="position: relative; display: inline-block; cursor: pointer" onclick="changeDirection('${route_token}', '${index}', 'driving-traffic')">${traffic}</div>`;
    } else if (direction_type === 'walking') {
        now = walking;
        other = `<div style="position: relative; display: inline-block; cursor: pointer" onclick="changeDirection('${route_token}', '${index}', 'driving')">${driving}</div>
                 <div style="position: relative; display: inline-block; cursor: pointer" onclick="changeDirection('${route_token}', '${index}', 'cycling')">${cycling}</div>
                 <div style="position: relative; display: inline-block; cursor: pointer" onclick="changeDirection('${route_token}', '${index}', 'driving-traffic')">${traffic}</div>`;
    } else if (direction_type === 'cycling') {
        now = cycling;
        other = `<div style="position: relative; display: inline-block; cursor: pointer" onclick="changeDirection('${route_token}', '${index}', 'walking')">${walking}</div>
                 <div style="position: relative; display: inline-block; cursor: pointer" onclick="changeDirection('${route_token}', '${index}', 'driving')">${driving}</div>
                 <div style="position: relative; display: inline-block; cursor: pointer" onclick="changeDirection('${route_token}', '${index}', 'driving-traffic')">${traffic}</div>`;
    } else {
        now = traffic;
        other = `<div style="position: relative; display: inline-block; cursor: pointer" onclick="changeDirection('${route_token}', '${index}', 'walking')">${walking}</div>
                 <div style="position: relative; display: inline-block; cursor: pointer" onclick="changeDirection('${route_token}', '${index}', 'cycling')">${cycling}</div>
                 <div style="position: relative; display: inline-block; cursor: pointer" onclick="changeDirection('${route_token}', '${index}', 'driving')">${driving}</div>`;
    }
    let pane = `<div class="point-list-layer-body-item">
                                    <span style="margin-left: 11px; color: ${color}">|</span>
                                            <div class="point-logo">
                                                <div class="point-logo-svg" id="direction-logo-${index}" style="background-position:center; background-size:contain; background-color: #FFFFFF;" iconcode="1899-0288D1">`;
    pane += now;
    pane += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="11" height="11" style="padding-bottom: 5px; cursor: pointer" onclick="choseDirectionType('${index}', '${escape(now)}', '${escape(other)}')"><path fill="none" d="M0 0h24v24H0z"/><path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" fill="#000"/></svg>`;

    let distance = '';
    if (typeof(direction["distance"]) != 'undefined' && direction["distance"] > 100) {
        distance = `${Math.floor(direction["distance"]/100)/10}km`;
    } else {
        distance = `${Math.floor(direction["distance"])}m`;
    }
    let duration = '';
    if (typeof(direction["duration"]) != 'undefined' && direction["duration"] > 3600) {
        duration = `${Math.floor(direction["duration"]/3600)}h`;
        direction["duration"] = direction["duration"]%3600;
    }
    if (direction["duration"] > 60) {
        duration += `${Math.floor(direction["duration"]/60)}m`;
        direction["duration"] = direction["duration"]%60;
    }
    duration += `${Math.floor(direction["duration"])}s`;

    pane += `</div>
                                            </div>
                                            <div class="point-font-container" id="">
                                                ${distance}, ${duration}
                                            </div>
                                        </div>`;
    return pane
};

updateRouteInfoList = async function (route_info) {
    while (mainPrint === true) {
        await sleep(500);
    }
    // print to route-info-list
    let pane = "";
    let pointInfoList = [];
    let index = 0;
    for(let point of route_info["route_point"]) {
        if (point["direction"] !== "") {
            let direction = JSON.parse(point["direction"]);
            let polyline = printDirection(direction, route_info["route_color"]);
            polyline.addTo(map);
            addPolylineCache(route_info["route_token"], polyline);
            pane += createDirectionHtml(route_info["route_token"], index, direction, route_info["route_color"], point["direction_type"]);
        }
        pane += createPointHtml(point);
        pointInfoList.push(point);
        index += 1
    }
    pane += addRoutePointLogo(route_info["route_token"], route_info["route_color"]);
    routeInfoMap.set(route_info["route_token"], pane);
    routePointMap.set(route_info["route_token"], pointInfoList);
    routeColorMap.set(route_info["route_token"], route_info["route_color"]);
    let id = `route_info_list_${route_info["route_token"]}`;
    if (document.getElementById(id)) {
        document.getElementById(id).innerHTML = pane;
    } else {
        console.log("getElementById failed");
    }
};

addPolylineCache = function (route_token, polyline) {
    let polylineList = [];
    if (typeof(routeDirectionMap.get(route_token)) === 'undefined') {
    } else {
        polylineList = routeDirectionMap.get(route_token);
    }

    polylineList.push(polyline);
    routeDirectionMap.set(route_token, polylineList);
};

addRoutePointLogo = function (route_token, route_color = '') {
    return `<div id="add_route_point_info_${route_token}" style="cursor: pointer; font: 400 13px Roboto, Arial, sans-serif; color: #777777; width: 65px;" onclick="addRoutePointPrepare('${route_token}', '${route_color}')">
                    <div>添加路线点</div>
            </div>`;
};

addRoutePointPrepare = function (route_token, route_color) {
    if (addRoutePointToken === route_token) {
        // close add route point switch
        removeRoutePointSelect(route_token);
    } else if (addRoutePointToken === '') {
        addRoutePointSelect(route_token, route_color);
    } else {
        removeRoutePointSelect(addRoutePointToken);
        addRoutePointSelect(route_token, route_color);
    }
};

addRoutePointSelect = function (route_token, route_color) {
    // 添加选中标示
    document.getElementById(`add_route_point_info_${route_token}`).style.color = '#444444';
    addRoutePointSwitch = true;
    addRoutePointToken = route_token;
    addRoutePointColor = route_color;
};

removeRoutePointSelect = function (route_token) {
    // 添加取消标示
    document.getElementById(`add_route_point_info_${route_token}`).style.color = '#777777';
    addRoutePointSwitch = false;
    addRoutePointToken = '';
};

addRoutePoint = async function (route_token, point, route_color) {
    if (typeof(routePointMap.get(route_token)) === 'undefined') {
        console.log("routePointMap error");
    }
    while (routePointMapMutex === true) {
        await sleep(500);
    }
    routePointMapMutex = true;
    let routePoint = routePointMap.get(route_token);
    let length = routePoint.length;
    if (routePoint.length > 0) {
        // 生成路线
        let nearPoint = routePoint[routePoint.length - 1];
        let [lon, lat] = nearPoint["center"].split(",");
        getDirection(length, lon, lat, point._latlng["lng"], point._latlng["lat"], route_token, point["options"]["point_token"], route_color);
    } else {
        addRoutePointRequest(route_token, point["options"]["point_token"]);
    }

    // add to feature list
    routePoint.push({center: `${point._latlng["lng"]},${point._latlng["lat"]}`, direction: '', point_id: point["options"]["point_id"], point_type: point["options"]["point_type"], text: point["options"]["text"]});
    let pane = "";
    let index = 0;
    for(let point of routePoint) {
        if (point["direction"] !== '') {
            let direction = JSON.parse(point["direction"]);
            pane += createDirectionHtml(route_token, index, direction, route_color, point["direction_type"]);
        }
        pane += createPointHtml(point);
        index += 1
    }
    pane += addRoutePointLogo(route_token, route_color);
    let id = `route_info_list_${route_token}`;
    if (document.getElementById(id)) {
        document.getElementById(id).innerHTML = pane;
    } else {
        console.log("getElementById failed");
    }
    routeInfoMap.set(route_token, pane);
    routePointMap.set(route_token, routePoint);
    routePointMapMutex = false;
};

addRoutePointRequest = function (route_token, point_token, direction = '') {
    // addRoutePointRequest
    fetch(requestConfig.domain + requestConfig.addRoutePoint, {
        credentials: 'include',
        method: 'POST',
        body: '{"route_token": "' + route_token + '",' +
            '"point_token": "' + point_token + '",' +
            '"direction": ' + JSON.stringify(direction) + '}',
    }).then(response => {
        return response.json();
    }).then(data => {
        console.log(data);
        if (data.code !== 0) {
            console.log("addRoutePoint failed, code:", data.code);
        } else {
            // 更新时间
            updateStrokeUpdateTime(data.data["update_time"]);
        }
    }).catch(function(e) {
        console.log("addRoutePoint error", e);
    });
};

printDirection = function (direction, color) {
    let coordinates = changeLonLat(direction.geometry.coordinates);
    let polyline = L.polyline(coordinates, {color: color}); // 5eb0cc
    return polyline;
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

define(function (require) {
    require("./direction");
});
