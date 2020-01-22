
foodMarker = []; // 点marker集合
foodIndex = 0;   // 点index偏移量
foodInfos = new Map();
foodPopupOption = {
    autoPanPaddingTopLeft: L.point(350, 80),
    autoPanPaddingBottomRight: L.point(420, 100),
};

emptyFood = function (e) {
    for (let food of foodMarker) {
        food.removeFrom(map);
    }
    foodMarker = [];
    foodIndex = 0;
};

allowFood = function (food) {
    for (let search of foodMarker) {
        if (search["options"]["point_id"] === food["id"]) {
            return false;
        }
    }
    for (let search of userMarkers) {
        if (search["options"]["point_id"] === food["id"] &&
            search["options"]["point_type"] === "yelp_food") {
            return false;
        }
    }
    return true;
};

foodMarketPopup = function(index, point_id, text, place_name, lat, lon, url = '') {
    return `<p class="leaflet-info-window-name">${text}</p>
                <p class="leaflet-info-window-address" onclick="window.open('${url}', '_blank')" style="cursor: pointer">${place_name}</p>
                <div class="leaflet-info-window-btns">
                    <p class="leaflet-info-window-latlon">
                        <i class="leaflet-info-window-icon icon-loc"></i>
                        ${lat.toFixed(6)}, ${lon.toFixed(6)}
                    </p>
                    <a class="leaflet-info-window-btn" style="cursor: pointer" onclick="addFoodPoint('${index}', '${point_id}', '${text}', '${place_name}', '${lon},${lat}');">
                        <i class="leaflet-info-window-icon icon-add"></i>
                            添加到点集
                    </>
                </div>`
};

userFoodMarket = function(point_id, text, place_name, lat, lon, url = '') {
    return `<p class="leaflet-info-window-name">${text}</p>
                <p class="leaflet-info-window-address" onclick="window.open('${url}', '_blank')" style="cursor: pointer">${place_name}</p>
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

setFoodMarket = function (food) {
    let lat = parseFloat(food["coordinates"]["latitude"]);
    let lon = parseFloat(food["coordinates"]["longitude"]);
    let marker = L.marker([-360, -360], {icon: addIcon(L.mapbox, 'restaurant'), index: foodIndex, point_id: food["id"], point_type: "yelp_food", text: food["name"], food: food, lat: lat, lon: lon});
    marker.addTo(map);
    marker.setLatLng([lat, lon]);
    let place_name = food["alias"] + " ";
    for (let i = 0; i < food["location"]["display_address"].length; i++) {
        place_name = place_name + food["location"]["display_address"][i];
        if (i !== food["location"]["display_address"].length - 1) {
            place_name += ", "
        }
    }
    marker.bindPopup(foodMarketPopup(foodIndex, food["id"], food["name"], place_name, lat, lon, food["url"]), foodPopupOption);
    foodMarker.push(marker);

    // 下标提示
    // let nameMarker = L.marker([lat, lon], {icon: textIcon(`${hotel["hotelName"]} ¥${hotel["dailyRate"]}`), index: hotelIndox, point_id: hotel["hotelId"], point_type: "agoda_hotel"});
    // nameMarker.addTo(map);
    // hotelNameMarker.push(nameMarker);
    foodIndex += 1;
};

showFoodInfo = function (marker) {
    let foodInfo = foodInfos.get(marker["options"]["point_id"]);
    if (typeof(foodInfo) == "undefined") {
        getFoodInfo(marker["options"]["point_id"]);
    } else {
        let pane = packFoodInfo(foodInfo);
        document.getElementById('featurelist-pane-info').innerHTML = pane;
    }
};

// 酒店添加到点集后用户点集变动
foodMarketToUserMarket = function (point_id, point_type, point_token, place_name) {
    for (let i = 0; i < foodMarker.length; i++) {
        if (foodMarker[i]["options"]["point_id"] === point_id && foodMarker[i]["options"]["point_type"] === point_type) {
            foodMarker[i].setPopupContent(userFoodMarket(foodMarker[i]["options"]["point_id"], foodMarker[i]["options"]["food"]["name"], place_name, foodMarker[i]["options"]["lat"], foodMarker[i]["options"]["lon"], foodMarker[i]["options"]["food"]["url"]), foodPopupOption);
            let lat = parseFloat(foodMarker[i]["options"]["lat"]);
            let lon = parseFloat(foodMarker[i]["options"]["lon"]);
            let userMarker = L.marker([lat, lon], {index: userMarketIndex, icon: addIcon(L.mapbox, 'restaurant'), point_id: foodMarker[i]["options"]["point_id"], point_type: "yelp_food", point_token: point_token, text: foodMarker[i]["options"]["food"]["name"]});
            userMarker.addTo(map);
            userMarker.bindPopup(userFoodMarket(foodMarker[i]["options"]["point_id"], foodMarker[i]["options"]["food"]["name"], place_name, foodMarker[i]["options"]["lat"], foodMarker[i]["options"]["lon"], foodMarker[i]["options"]["food"]["url"]), foodPopupOption);
            userMarkers.push(userMarker);
            userMarketIndex += 1;
            // 添加后会存在闪烁，故不删除原来点，在行程点被删除后删除
            // hotelMarker[i].removeFrom(map);
            // hotelMarker.splice(i, 1);
            break
        }
    }
};

/* ============================================================http request============================================================ */

searchNearFood = function (e) {
    console.log(e.latlng);
    fetch(requestConfig.domain + requestConfig.searchFood, {
        credentials: 'include',
        method: 'POST',
        body: '{"latitude": "' + e.latlng.lat + '",' +
            '"longitude": "' + e.latlng.lng + '"}'
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data.code !== 0) {
            console.log("searchNearFood failed, code:", data.code);
        } else {
            let result = JSON.parse(data.data);
            if (typeof(result["error"]) != "undefined") {
                console.log("searchNearFood failed, error:", result["error"]);
            } else {
                if (typeof(result["businesses"]) !== "undefined") {
                    for (let food of result["businesses"]) {
                        if (allowFood(food)) {
                            setFoodMarket(food);
                        } else {
                            console.log("not allow");
                        }
                    }
                } else {
                    console.log("no business return");
                }
            }
        }
    }).catch(function(e) {
        console.log("searchNearFood error", e);
    });
};

getFoodInfo = function (point_id) {
    let url = requestConfig.domain + requestConfig.getFoodInfo + point_id + '/';
    fetch(url, {
        credentials: 'include',
        method: 'GET',
    }).then(response => {
        return response.json();
    }).then(data => {
        console.log(data);
        if (data.code !== 0) {
            console.log("getFoodInfo failed, code:", data.code);
        } else {
            let foodInfo = JSON.parse(data.data);
            foodInfos.set(point_id, foodInfo);
            let pane = packFoodInfo(foodInfo);
            document.getElementById('featurelist-pane-info').innerHTML = pane;
        }
    }).catch(function(e) {
        console.log("getFoodInfo error", e);
    });
};

addFoodPoint = function (index, point_id, text, place_name, center, point_type = 'yelp_food') {
    console.log("addFoodPoint", point_id, text, place_name, center, point_type);
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
            console.log("addFoodPoint failed, code:", data.code);
        } else {
            foodMarketToUserMarket(point_id, point_type, data.data["point_info"]["point_token"], place_name);
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
        console.log("addFoodPoint error:", e);
    });
};

/* ============================================================html============================================================ */

packFoodInfo = function (foodInfo) {
    let size = getClientSize();
    let location = "";
    for (let i = 0; i < foodInfo["location"]["display_address"].length; i++) {
        location = location + foodInfo["location"]["display_address"][i];
        if (i !== foodInfo["location"]["display_address"].length - 1) {
            location += ", "
        }
    }
    let workTime = [];
    for (let i = 0; i < foodInfo["hours"][0]["open"].length; i++) {
        let day = "";
        if (foodInfo["hours"][0]["open"][i]["day"] === 0) {
            day = "星期一";
        } else if (foodInfo["hours"][0]["open"][i]["day"] === 1) {
            day = "星期二";
        } else if (foodInfo["hours"][0]["open"][i]["day"] === 2) {
            day = "星期三";
        } else if (foodInfo["hours"][0]["open"][i]["day"] === 3) {
            day = "星期四";
        } else if (foodInfo["hours"][0]["open"][i]["day"] === 4) {
            day = "星期五";
        } else if (foodInfo["hours"][0]["open"][i]["day"] === 5) {
            day = "星期六";
        } else if (foodInfo["hours"][0]["open"][i]["day"] === 6) {
            day = "星期天";
        }
        let str = day + "&nbsp&nbsp&nbsp&nbsp" + foodInfo["hours"][0]["open"][i]["start"].slice(0,2) + ":" + foodInfo["hours"][0]["open"][i]["start"].slice(2,4) + " - "
            + foodInfo["hours"][0]["open"][i]["end"].slice(0,2) + ":" + foodInfo["hours"][0]["open"][i]["end"].slice(2,4);
        workTime.push(str);
        // workTime += str;
        // if (i !== foodInfo["hours"][0]["open"].length - 1) {
        //     workTime += "\n";
        // }
    }
    let pane = `<div style="max-height: ${size.height}px; overflow-x: hidden; overflow-y: auto; position: absolute; background-color: #FFFFFF; width: 408px">
                <div>
                    <div style="display: block; width: 100%; height: 240px;">
                        <button style=" width: 100%; height: 100%; cursor: pointer; position: relative" onclick="window.open('${foodInfo["url"]}', '_blank')">
                            <img src="${foodInfo["image_url"]}" style="position: absolute; top: 50%;left: 50%;width: 407px;height: 240px;-webkit-transform: translateY(-50%) translateX(-50%);transform: translateY(-50%) translateX(-50%);">
                        </button>
                    </div>
                    <div class="section-hero-header-title">
                        <div class="section-hero-header-title-description">
                            <div><h1 class="GLOBAL__gm2-headline-5">${foodInfo["name"]}</h1></div>
                            <h2 class="section-hero-header-title-subtitle"><span>${foodInfo["alias"]}</span></h2>
                            <div class="section-hero-header-title-description-container">
                                <div>
                                    <div style="margin-top: 8px;">
                                        <div>
                                            <span style="font-size: 13px; position: absolute; line-height: 14px">${foodInfo["rating"]}</span>
                                            <ol role="img" class="section-star-array">`;

    if (foodInfo["rating"] <= 0.5) {
        pane += `
            <l1 class="section-star section-star-half"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
        `
    } else if (foodInfo["rating"] <= 1) {
        pane += `
            <l1 class="section-star"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
        `
    } else if (foodInfo["rating"] <= 1.5) {
        pane += `
            <l1 class="section-star"></l1>
            <l1 class="section-star section-star-half"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
        `
    } else if (foodInfo["rating"] <= 2) {
        pane += `
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
        `
    } else if (foodInfo["rating"] <= 2.5) {
        pane += `
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star section-star-half"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
        `
    } else if (foodInfo["rating"] <= 3) {
        pane += `
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
        `
    } else if (foodInfo["rating"] <= 3.5) {
        pane += `
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star section-star-half"></l1>
            <l1 class="section-star section-star-empty"></l1>
        `
    } else if (foodInfo["rating"] <= 4) {
        pane += `
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star section-star-empty"></l1>
        `
    } else if (foodInfo["rating"] <= 4.5) {
        pane += `
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star section-star-half"></l1>
        `
    } else {
        pane += `
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
        `
    }

    pane += `</ol>
                                            <span style="font-weight: bold; margin: 0 4px; position: absolute; line-height: 14px; font-family: Roboto, 'Noto Sans Devanagari UI', 'Noto Sans Bengali UI', 'Noto Sans Telugu UI', 'Noto Sans Tamil UI', 'Noto Sans Gujarati UI', 'Noto Sans Kannada UI', 'Noto Sans Malayalam UI', 'Noto Sans Gurmukhi UI', Arial, sans-serif">消费水平: ${foodInfo["price"]}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="flex: none; border-bottom: 1px solid #e6e6e6; height: 0"></div>
                        <div class="section-subheader">
                            <h2 class="GLOBAL__gm2-subtitle-alt-1">详情</h2>
                            <div style="display: block; height: 16px;"></div>
                            <div style="font-size: 13px; flex: none; position: relative">
                                <div style="display: inherit">
                                    <div style="padding: 4px 24px 4px 0; display: flex; align-items: center; position: relative">
                                        <span style="margin-left: 24px; margin-right: 24px; flex: 0 0 24px">
                                            <img style="display: block; width: 24px; height: 24px" src="//www.gstatic.com/images/icons/material/system_gm/2x/restaurant_gm_blue_24dp.png">
                                        </span>
                                        <span class="section-info-text">`;
    for (let cat of foodInfo["categories"]) {
        pane += `<span>
                                                <div style="color: #66be5b; border: 1px solid; border-color: #66be5b; margin-right: 3px; padding: 1px 3px; display: inline-block">${cat["title"]}</div>
                                            </span>`
    }
    pane += `</span>
                                    </div>
                                </div>
                                <div style="display: inherit">
                                    <div style="padding: 4px 24px 4px 0; display: flex; align-items: center; position: relative">
                                        <span style="margin-left: 24px; margin-right: 24px; flex: 0 0 24px">
                                            <img style="display: block; width: 24px; height: 24px" src="//www.gstatic.com/images/icons/material/system_gm/2x/place_gm_blue_24dp.png">
                                        </span>
                                        <span class="section-info-text">
                                            <span>${location}</span>
                                        </span>
                                    </div>
                                </div>
                                <div style="display: inherit">
                                    <div style="padding: 4px 24px 4px 0; display: flex; align-items: center; position: relative">
                                        <span style="margin-left: 24px; margin-right: 24px; flex: 0 0 24px">
                                            <img style="display: block; width: 24px; height: 24px" src="//www.gstatic.com/images/icons/material/system_gm/2x/public_gm_blue_24dp.png">
                                        </span>
                                        <span class="section-info-text">
                                            <span onclick="window.open('${foodInfo["url"]}', '_blank')" style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">www.yelp.com</span>
                                        </span>
                                    </div>
                                </div>
                                <div style="display: inherit">
                                    <div style="padding: 4px 24px 4px 0; display: flex; align-items: center; position: relative">
                                        <span style="margin-left: 24px; margin-right: 24px; flex: 0 0 24px">
                                            <img style="display: block; width: 24px; height: 24px" src="//www.gstatic.com/images/icons/material/system_gm/2x/phone_gm_blue_24dp.png">
                                        </span>
                                        <span class="section-info-text">
                                            <span>${foodInfo["display_phone"]}</span>
                                        </span>
                                    </div>
                                </div>
                                <div style="display: inherit">
                                    <div style="padding: 4px 24px 4px 0; display: flex; align-items: center; position: relative">
                                        <span style="margin-left: 24px; margin-right: 24px; flex: 0 0 24px">
                                            <img style="display: block; width: 24px; height: 24px" src="//www.gstatic.com/images/icons/material/system_gm/2x/schedule_gm_blue_24dp.png">
                                        </span>
                                        <span class="section-info-text">`;
        for (let time of workTime) {
            pane += `<span style="display: block">${time}</span>`
        }
        pane += `</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="flex: none; border-bottom: 1px solid #e6e6e6; height: 0"></div>
                        <div class="section-subheader">
                            <h2 class="GLOBAL__gm2-subtitle-alt-1">照片</h2>
                        </div>
                        <div class="photo-wall" style="overflow-x: auto; overflow-y: hidden; min-height: 100px; display: flex;">`;
    for (let photo of foodInfo["photos"]) {
        pane += `<div style="display: inline-block; margin-bottom: 16px; margin-right: 8px; height: 120px">
                                <button style="border: 0; padding: 0; position: relative; border-radius: 8px; overflow: hidden; width: 115px; height: 120px; cursor: pointer;" onclick="window.open('${photo}', '_blank')">
                                    <div style="height: 120px; width: 115px; position: relative; overflow: hidden; direction: ltr">
                                        <img src="${photo}" style="position: absolute; top: 50%; left: 50%; width: 115px; height: 121px; transform: translateY(-50%) translateX(-50%); display: block;">
                                    </div>
                                </button>
                            </div>`
    }
    pane += `
                        </div>
                        <div class="liubai"></div>
                        <div style="flex: none; border-bottom: 1px solid #e6e6e6; height: 0"></div>
                    </div>
                </div></div>`;
    return pane
};
