hotelMarker = [];
hotelNameMarker = [];
hotelInfos = new Map();
hotelPopupOption = {
    autoPanPaddingTopLeft: L.point(350, 80),
    autoPanPaddingBottomRight: L.point(420, 100),
};
hotelIndox = 0;

emptyHotel = function (e) {
    for (let hotel of hotelMarker) {
        hotel.removeFrom(map);
    }
    for (let hotelName of hotelNameMarker) {
        hotelName.removeFrom(map);
    }
    hotelMarker = [];
    hotelNameMarker = [];
    hotelIndox = 0;
};

Date.prototype.format = function (fmt) {
    let o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

searchNearHotel = function (e) {
    console.log(e.latlng);
    let nowTime = new Date();
    nowTime.setDate(nowTime.getDate() + 1);
    let checkInTime = nowTime.format("yyyy-MM-dd");
    nowTime.setDate(nowTime.getDate() + 1);
    let checkOutTime = nowTime.format("yyyy-MM-dd");
    fetch(requestConfig.domain + requestConfig.searchHotel, {
        credentials: 'include',
        method: 'POST',
        body: '{"latitude": "' + e.latlng.lat + '",' +
            '"longitude": "' + e.latlng.lng + '",' +
            '"check_in_data": "' + checkInTime + '",' +
            '"check_out_data": "' + checkOutTime + '"}',
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data.code !== 0) {
            console.log("searchNearHotel failed, code:", data.code);
        } else {
            let result = JSON.parse(data.data);
            if (result["isSuccess"] === true) {
                let allowID = [];
                for (let hotel of result["result"]["results"]) {
                    if (allowHotel(hotel)) {
                        hotel["check_in_data"] = checkInTime;
                        hotel["check_out_data"] = checkOutTime;
                        setHotelMarket(hotel);
                        allowID.push(hotel["hotelId"]);
                    }
                }
                mGetHotelInfo(allowID);
            }
        }
    }).catch(function(e) {
        console.log("searchNearHotel error", e);
    });
};

mGetHotelInfo = function (hotelID) {
    fetch(requestConfig.domain + requestConfig.getHotel, {
        credentials: 'include',
        method: 'POST',
        body: '{"hotel_ids": [' + hotelID + ']}',
    }).then(response => {
        return response.json();
    }).then(data => {
        console.log(data);
        if (data.code !== 0) {
            console.log("getHotel failed, code:", data.code);
        } else {
            for (let hotel of hotelID) {
                if (typeof (data.data[hotel]) === "undefined") {
                    continue;
                }
                hotelInfos.set(hotel, data.data[hotel]);
            }
        }
    }).catch(function(e) {
        console.log("getHotel error", e);
    });
};

allowHotel = function (hotel) {
    for (let search of hotelMarker) {
        if (search["options"]["point_id"] === hotel["hotelId"]) {
            return false;
        }
    }
    return true;
};

setHotelMarket = function (hotel) {
    let marker = L.marker([-360, -360], {icon: addIcon(L.mapbox, 'building'), index: hotelIndox, point_id: hotel["hotelId"], point_type: "agoda_hotel", text: hotel["hotelName"], hotel: hotel});
    let lat = parseFloat(hotel["latitude"]);
    let lon = parseFloat(hotel["longitude"]);
    marker.addTo(map);
    marker.setLatLng([lat, lon]);
    marker.bindPopup(hotelMarketPopup(hotelIndox, hotel["hotelId"], hotel["hotelName"], packHotelSummary(hotel), lat, lon, hotel["landingURL"]), hotelPopupOption);
    hotelMarker.push(marker);

    let nameMarker = L.marker([lat, lon], {icon: textIcon(`${hotel["hotelName"]} ¥${hotel["dailyRate"]}`), index: hotelIndox, point_id: hotel["hotelId"], point_type: "agoda_hotel"});
    nameMarker.addTo(map);
    hotelNameMarker.push(nameMarker);
    hotelIndox += 1;
};

textIcon = function (htmlText) {
    return L.divIcon({
        className: 'hotel-label',
        html: htmlText,
        iconSize: [80, 0]
    });
};

packHotelSummary = function (hotel) {
    return `星级: ${hotel["starRating"]}, 评分: ${hotel["reviewScore"]}, 价格: ¥${hotel["dailyRate"]} <a style="color: #0052cc">点击预定</a>`;
};

hotelMarketPopup = function(index, point_id, text, place_name, lat, lon, url = '') {
    return `<p class="leaflet-info-window-name">${text}</p>
                <p class="leaflet-info-window-address" onclick="window.open('${url}', '_blank')" style="cursor: pointer">${place_name}</p>
                <div class="leaflet-info-window-btns">
                    <p class="leaflet-info-window-latlon">
                        <i class="leaflet-info-window-icon icon-loc"></i>
                        ${lat.toFixed(6)}, ${lon.toFixed(6)}
                    </p>
                    <a class="leaflet-info-window-btn" style="cursor: pointer" onclick="addHotelPoint('${index}', '${point_id}', '${text}', '', '${lon},${lat}');">
                        <i class="leaflet-info-window-icon icon-add"></i>
                            添加到点集
                    </>
                </div>`
};

addHotelPoint = function (index, point_id, text, place_name, center, point_type = 'agoda_hotel') {
    console.log("addHotelPoint", point_id, text, place_name, center, point_type);
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
            searchHotelToUserMarket(index, data.data["point_info"]["point_token"]);
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
        console.log("addPoint error:", e);
    });
};

userHotelMarket = function(point_id, text, place_name, lat, lon, url = '') {
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

searchHotelToUserMarket = function (index, point_token) {
    let market = hotelMarker[index];
    market.setPopupContent(userHotelMarket(market["options"]["hotel"]["hotelId"], market["options"]["hotel"]["hotelName"], packHotelSummary(market["options"]["hotel"]), market["options"]["hotel"]["latitude"], market["options"]["hotel"]["longitude"], market["options"]["hotel"]["landingURL"]), popupOption);

    let lat = parseFloat(market["options"]["hotel"]["latitude"]);
    let lon = parseFloat(market["options"]["hotel"]["longitude"]);
    let userMarker = L.marker([lat, lon], {index: userMarketIndex, icon: addIcon(L.mapbox, 'building'), point_id: market["options"]["point_id"], point_type: "agoda_hotel", point_token: point_token, text: market["options"]["hotel"]["hotelName"], hotel: market["options"]["hotel"]});
    userMarker.addTo(map);
    userMarker.bindPopup(userHotelMarket(market["options"]["hotel"]["hotelId"], market["options"]["hotel"]["hotelName"], packHotelSummary(market["options"]["hotel"]), market["options"]["hotel"]["latitude"], market["options"]["hotel"]["longitude"], market["options"]["hotel"]["landingURL"]), popupOption);
    userMarkers.push(userMarker);
    userMarketIndex += 1;

    hotelNameMarker[index].removeFrom(map);
    let nameMarker = L.marker([lat, lon], {icon: textIcon(`${market["options"]["hotel"]["hotelName"]} ¥${market["options"]["hotel"]["dailyRate"]}`), point_id: market["options"]["hotel"]["hotelId"], point_type: "agoda_hotel"});
    nameMarker.addTo(map);
    userNameMarker.push(nameMarker);
};

function getClientSize() {
    let c = window,
        b = document,
        a = b.documentElement;
    if (c.innerHeight) {
        return {
            width: c.innerWidth,
            height: c.innerHeight
        }
    } else {
        if (a && a.clientHeight) {
            return {
                width: a.clientWidth,
                height: a.clientHeight
            }
        } else {
            return {
                width: b.body.clientWidth,
                height: b.body.clientHeight
            }
        }
    }
}

packHotelInfo = function (hotel, hotelInfo) {
    console.log(hotel, hotelInfo);
    let size = getClientSize();
    let pane = `<div style="max-height: ${size.height}px; overflow-x: hidden; overflow-y: auto; position: absolute; background-color: #FFFFFF; width: 408px">
                <div>
                    <div style="display: block; width: 100%; height: 240px;">
                        <button style=" width: 100%; height: 100%; cursor: pointer; position: relative" onclick="window.open('${hotel["imageURL"]}', '_blank')">
                            <img src="${hotel["imageURL"]}" style="position: absolute; top: 50%;left: 50%;width: 407px;height: 240px;-webkit-transform: translateY(-50%) translateX(-50%);transform: translateY(-50%) translateX(-50%);">
                        </button>
                    </div>
                    <div class="section-hero-header-title">
                        <div class="section-hero-header-title-description">
                            <div><h1 class="GLOBAL__gm2-headline-5">${hotelInfo["hotel_translated_name"]}</h1></div>
                            <h2 class="section-hero-header-title-subtitle"><span>${hotelInfo["hotel_name"]}</span></h2>
                            <div class="section-hero-header-title-description-container">
                                <div>
                                    <div style="margin-top: 8px;">
                                        <div>
                                            <span style="font-size: 13px; position: absolute; line-height: 14px">${hotel["reviewScore"]}</span>
                                            <ol role="img" class="section-star-array">`;

    if (hotel["reviewScore"] <= 1) {
        pane += `
            <l1 class="section-star section-star-half"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
        `
    } else if (hotel["reviewScore"] <= 2) {
        pane += `
            <l1 class="section-star"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
        `
    } else if (hotel["reviewScore"] <= 3) {
        pane += `
            <l1 class="section-star"></l1>
            <l1 class="section-star section-star-half"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
        `
    } else if (hotel["reviewScore"] <= 4) {
        pane += `
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
        `
    } else if (hotel["reviewScore"] <= 5) {
        pane += `
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star section-star-half"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
        `
    } else if (hotel["reviewScore"] <= 6) {
        pane += `
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star section-star-empty"></l1>
            <l1 class="section-star section-star-empty"></l1>
        `
    } else if (hotel["reviewScore"] <= 7) {
        pane += `
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star section-star-half"></l1>
            <l1 class="section-star section-star-empty"></l1>
        `
    } else if (hotel["reviewScore"] <= 8) {
        pane += `
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star"></l1>
            <l1 class="section-star section-star-empty"></l1>
        `
    } else if (hotel["reviewScore"] <= 9) {
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
                                            <span style="font-weight: bold; margin: 0 4px; position: absolute; line-height: 14px; font-family: Roboto, 'Noto Sans Devanagari UI', 'Noto Sans Bengali UI', 'Noto Sans Telugu UI', 'Noto Sans Tamil UI', 'Noto Sans Gujarati UI', 'Noto Sans Kannada UI', 'Noto Sans Malayalam UI', 'Noto Sans Gurmukhi UI', Arial, sans-serif">${hotelInfo["star_rating"]}星酒店</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="flex: none; border-bottom: 1px solid #e6e6e6; height: 0"></div>
                        <div class="section-subheader" style="padding-bottom: 8px;">
                            <h2 class="GLOBAL__gm2-subtitle-alt-1">价格</h2>
                        </div>
                        <div style="padding-bottom: 6px; display: flex; flex-direction: row">
                            <div class="section-date-range-selection-container">
                                <div class="GLOBAL__gm2-caption section-date-range-combined-label" style="margin-bottom: 2px">入住/退房</div>
                                <div class="section-date-range-selection-control">
                                    <div class="section-date-range-group section-date-range-first">
                                        <input type="text" class="GLOBAL__gm2-body-2" placeholder="${hotel["check_in_data"]} - ${hotel["check_out_data"]}" id="check-data" style="text-align:center; border: none; height: 36px; width: 298px; margin-top: 6px; margin-left: 1px;">
                                    </div>
                                </div>
                            </div>
                            <div class="section-occupancy-selection">
                                <span class="section-occupancy-selection-person-icon"></span>
                                <button class="GLOBAL__gm2-hairline-border GLOBAL__gm2-body-2 section-occupancy-selection-dropdown" style="width: 48px; height: 48px; text-align:center;">2</button>
                            </div>
                        </div>
                        <div class="section-hotel-prices-container">
                            <div class="section-hotel-prices-section">
                                <div class="section-hotel-prices-booking-container" id="section-hotel-prices-booking-container">
                                    <div class="section-hotel-prices-booking-part" id="agoda_hotel_${hotel["hotelId"]}">`;
    pane +=  setAgodaHotelBooking(hotel);
    pane += `</div>
                                </div>
                            </div>
                        </div>
                        <div style="flex: none; border-bottom: 1px solid #e6e6e6; height: 0"></div>
                        <div class="section-subheader">
                            <h2 class="GLOBAL__gm2-subtitle-alt-1">简介</h2>
                            <div style="margin-top: 3px; margin-bottom: 0;">${hotelInfo["over_view"]}</div>
                        </div>
                        <div style="flex: none; border-bottom: 1px solid #e6e6e6; height: 0"></div>
                        <div class="section-subheader">
                            <h2 class="GLOBAL__gm2-subtitle-alt-1">照片</h2>
                        </div>
                        <div class="photo-wall" style="overflow-x: auto; overflow-y: hidden; min-height: 100px; display: flex;">
                            <div style="display: inline-block; margin-bottom: 16px; margin-right: 8px; height: 120px">
                                <button style="border: 0; padding: 0; position: relative; border-radius: 8px; overflow: hidden; width: 115px; height: 120px; cursor: pointer;" onclick="window.open('${hotelInfo["photo2"]}', '_blank')">
                                    <div style="height: 120px; width: 115px; position: relative; overflow: hidden; direction: ltr">
                                        <img src="${hotelInfo["photo2"]}" style="position: absolute; top: 50%; left: 50%; width: 115px; height: 121px; transform: translateY(-50%) translateX(-50%); display: block;">
                                    </div>
                                </button>
                            </div>
                            <div style="display: inline-block; margin-bottom: 16px; margin-right: 8px; height: 120px">
                                <button style="border: 0; padding: 0; position: relative; border-radius: 8px; overflow: hidden; width: 115px; height: 120px; cursor: pointer;" onclick="window.open('${hotelInfo["photo3"]}', '_blank')">
                                    <div style="height: 120px; width: 115px; position: relative; overflow: hidden; direction: ltr">
                                        <img src="${hotelInfo["photo3"]}" style="position: absolute; top: 50%; left: 50%; width: 115px; height: 121px; transform: translateY(-50%) translateX(-50%); display: block;">
                                    </div>
                                </button>
                            </div>
                            <div style="display: inline-block; margin-bottom: 16px; margin-right: 8px; height: 120px">
                                <button style="border: 0; padding: 0; position: relative; border-radius: 8px; overflow: hidden; width: 115px; height: 120px; cursor: pointer;" onclick="window.open('${hotelInfo["photo4"]}', '_blank')">
                                    <div style="height: 120px; width: 115px; position: relative; overflow: hidden; direction: ltr">
                                        <img src="${hotelInfo["photo4"]}" style="position: absolute; top: 50%; left: 50%; width: 115px; height: 121px; transform: translateY(-50%) translateX(-50%); display: block;">
                                    </div>
                                </button>
                            </div>
                            <div style="display: inline-block; margin-bottom: 16px; margin-right: 0; padding-right: 24px; height: 120px">
                                <button style="border: 0; padding: 0; position: relative; border-radius: 8px; overflow: hidden; width: 115px; height: 120px; cursor: pointer;" onclick="window.open('${hotelInfo["photo5"]}', '_blank')">
                                    <div style="height: 120px; width: 115px; position: relative; overflow: hidden; direction: ltr">
                                        <img src="${hotelInfo["photo5"]}" style="position: absolute; top: 50%; left: 50%; width: 115px; height: 121px; transform: translateY(-50%) translateX(-50%); display: block;">
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div class="liubai"></div>
                        <div style="flex: none; border-bottom: 1px solid #e6e6e6; height: 0"></div>
                    </div>
                </div></div>`;
    return pane
};

setAgodaHotelBooking = function(hotel) {
    let pane = `<a href="${hotel["landingURL"]}" target="view_window" class="pVMtpLzfYWO__rate-row" style="color: #4285F4; text-decoration: none; outline: none;">
        <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; display: -webkit-flex; display: -ms-flexbox; display: flex; overflow: hidden; -moz-align-items: center; -webkit-align-items: center; align-items: center;">
        <img src="//www.gstatic.com/travel-hotels/branding/icon_100337601.png" class="pVMtpLzfYWO__partner-icon">
        <div class="pVMtpLzfYWO__partner-name">Agoda</div>
        <button class="pVMtpLzfYWO__nightly-price-button">`;
    if (hotel["includeBreakfast"] === true) {
        pane += `<div style="color: #66be5b; border: 1px solid; border-color: #66be5b; margin-right: 3px; padding: 1px 3px">早餐</div>`
    }
    if (hotel["freeWifi"] === true) {
        pane += `<div style="color: #66be5b; border: 1px solid; border-color: #66be5b; margin-right: 3px; padding: 1px 3px">wifi</div>`
    }
    pane += `
                                                        <div style="font-weight: 500;color: #333; font-size: 14px; text-decoration: none; margin-left: 6px;">¥ ${hotel["dailyRate"]}</div>
                                                        <span class="pVMtpLzfYWO__click-through-icon"></span>
                                                    </button>
                                                </div>
                                            </a>`;
    return pane
};

showHotelInfo = function (marker) {
    let hotelInfo = hotelInfos.get(marker["options"]["point_id"]);
    pane = packHotelInfo(marker["options"]["hotel"], hotelInfo);
    document.getElementById('featurelist-pane-hotel').innerHTML = pane;
    laydate.render({
        elem: '#check-data'
        ,min: 0
        ,range: true
        ,change: function(value, date, endDate){
            let [checkInTime, checkOutTime] = value.split(" - ");
            searchHotelPrice(marker, checkInTime, checkOutTime);
        }
    });
};

searchHotelPrice = function (marker, checkInTime, checkOutTime) {
    fetch(requestConfig.domain + requestConfig.hotelBooking, {
        credentials: 'include',
        method: 'POST',
        body: '{"hotel_ids": [' + marker["options"]["point_id"] + '],' +
            '"check_in_date": "' + checkInTime + '",' +
            '"check_out_date": "' + checkOutTime + '"}',
    }).then(response => {
        return response.json();
    }).then(data => {
        console.log(data);
        if (data.code !== 0) {
            console.log("hotelBooking failed:", data.code);
        } else {
            let result = JSON.parse(data.data);
            for (let hotel of result["results"]) {
                if (hotel["hotelId"] == marker["options"]["point_id"]) {
                    console.log(hotel, marker["options"]);
                    if (typeof(marker["options"]["hotel"]) == 'undefined') {
                        marker["options"]["hotel"] = {};
                    }
                    marker["options"]["hotel"] = hotel;
                    marker["options"]["hotel"]["check_in_data"] = checkInTime;
                    marker["options"]["hotel"]["check_out_data"] = checkOutTime;
                    marker.setPopupContent(hotelMarketPopup(marker["options"]["index"], marker["options"]["hotel"]["hotelId"], marker["options"]["hotel"]["hotelName"], packHotelSummary(marker["options"]["hotel"]), marker["options"]["hotel"]["latitude"], marker["options"]["hotel"]["longitude"], marker["options"]["hotel"]["landingURL"]), popupOption);
                    let pane = setAgodaHotelBooking(marker["options"]["hotel"]);
                    if (document.getElementById(`agoda_hotel_${marker["options"]["point_id"]}`)) {
                        document.getElementById(`agoda_hotel_${marker["options"]["point_id"]}`).innerHTML = pane;
                    }
                    for (let hotelName of hotelNameMarker) {
                        if (hotelName["options"]["point_id"] === marker["options"]["point_id"]) {
                            hotelName.setIcon(textIcon(`${hotel["hotelName"]} ¥${hotel["dailyRate"]}`));
                            break;
                        }
                    }
                    for (let hotelName of userNameMarker) {
                        if (hotelName["options"]["point_id"] === marker["options"]["point_id"]) {
                            hotelName.setIcon(textIcon(`${hotel["hotelName"]} ¥${hotel["dailyRate"]}`));
                            break;
                        }
                    }
                }
            }
        }
    }).catch(function(e) {
        console.log("hotelBooking error:", e);
    });
};
