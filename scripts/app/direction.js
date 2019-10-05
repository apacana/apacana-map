// 留白
changeDirection = function (route_token, index, direction_type) {
    let color = routeColorMap.get(route_token);
    let pointList = routePointMap.get(route_token);
    let startPoint = pointList[index - 1];
    let endPoint = pointList[index];
    let [start_lon, start_lat] = startPoint["center"].split(",");
    let [end_lon, end_lat] = endPoint["center"].split(",");
    resetDirection(index, start_lon, start_lat, end_lon, end_lat, route_token, color, direction_type);
};

resetDirection = function (index, start_lon, start_lat, end_lon, end_lat, route_token, route_color, profile = 'driving-traffic') {
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
                let polylineList = routeDirectionMap.get(route_token);
                polylineList[index-1].removeFrom(map);
                // print to map
                let polyline = L.polyline(coordinates, {color: route_color}); // 5eb0cc
                polyline.addTo(map);
                polylineList[index-1] = polyline;
                routeDirectionMap.set(route_token, polylineList);

                direction = JSON.stringify(data.routes[0]);
                let pointInfoList = routePointMap.get(route_token);
                pointInfoList[index]["direction_type"] = profile;
                pointInfoList[index]["direction"] = direction;
                routePointMap.set(route_token, pointInfoList);

                // 渲染优化(P3)
                let pane = "";
                let newIndex = 0;
                for(let point of pointInfoList) {
                    if (point["direction"] !== "") {
                        let directionStruct = JSON.parse(point["direction"]);
                        pane += createDirectionHtml(route_token, newIndex, directionStruct, route_color, point["direction_type"]);
                    }
                    pane += createPointHtml(point);
                    newIndex += 1
                }
                pane += addRoutePointLogo(route_token, route_color);
                routeInfoMap.set(route_token, pane);
                let id = `route_info_list_${route_token}`;
                if (document.getElementById(id)) {
                    document.getElementById(id).innerHTML = pane;
                } else {
                    console.log("getElementById failed");
                }
            }
            // 通知backen
            makeUpdateDirectionRequest(index, route_token, direction, profile)
        }
    }).catch(function(e) {
        console.log("getDirection error", e);
    });
};

makeUpdateDirectionRequest = function (index, route_token, direction, direction_type) {
    fetch(requestConfig.domain + requestConfig.updateDirection, {
        credentials: 'include',
        method: 'POST',
        body: '{"route_token": "' + route_token + '",' +
            '"index": ' + index + ',' +
            '"direction_type": "' + direction_type + '",' +
            '"direction": ' + JSON.stringify(direction) + '}',
    }).then(response => {
        return response.json();
    }).then(data => {
        console.log(data);
        if (data.code !== 0) {
            console.log("updateDirection failed, code:", data.code);
        } else {
            // 更新时间
            updateStrokeUpdateTime(data.data["update_time"]);
        }
    }).catch(function(e) {
        console.log("updateDirection error", e);
    });
};
