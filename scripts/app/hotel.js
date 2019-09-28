// 留白
hotelMarker = [];
hotelInfos = new Map();

emptyHotel = function (e) {
    for (let hotel of hotelMarker) {
        hotel.removeFrom(map);
    }
    hotelMarker = [];
};

searchNearHotel = function (e) {
    console.log(e.latlng);
    fetch(requestConfig.domain + requestConfig.searchHotel, {
        credentials: 'include',
        method: 'POST',
        body: '{"latitude": "' + e.latlng.lat + '",' +
            '"longitude": "' + e.latlng.lng + '"}',
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
    let marker = L.marker([-360, -360], {icon: addIcon(L.mapbox, 'building'), point_id: hotel["hotelId"], point_type: "agoda_hotel", text: hotel["hotelName"], hotel: hotel});
    let lat = parseFloat(hotel["latitude"]);
    let lon = parseFloat(hotel["longitude"]);
    marker.addTo(map);
    marker.setLatLng([lat, lon]);
    marker.bindPopup(hotelMarketPopup(hotel["hotelName"], packHotelSummary(hotel), lat, lon, hotel["landingURL"]), popupOption);
    hotelMarker.push(marker)
};

packHotelSummary = function (hotel) {
    return `星级: ${hotel["starRating"]}, 评分: ${hotel["reviewScore"]}, 价格: ${hotel["dailyRate"]} ${hotel["currency"]} <a style="color: #0052cc">点击预定</a>`;
};

hotelMarketPopup = function(text, place_name, lat, lon, url = '') {
    return `<p class="leaflet-info-window-name">${text}</p>
                <p class="leaflet-info-window-address" onclick="window.open('${url}', '_blank')" style="cursor: pointer">${place_name}</p>
                <div class="leaflet-info-window-btns">
                    <p class="leaflet-info-window-latlon">
                        <i class="leaflet-info-window-icon icon-loc"></i>
                        ${lat.toFixed(6)}, ${lon.toFixed(6)}
                    </p>
                    <a class="leaflet-info-window-btn" style="cursor: pointer" onclick="addHotelPoint();">
                        <i class="leaflet-info-window-icon icon-add"></i>
                            添加到点集
                    </>
                </div>`
};

addHotelPoint = function () {
    console.log("addHotelPoint");
};

searchCallBack = function () {

};

addHotelMarker = function () {

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
    let pane = `<div style="max-height: ${size.height}px; overflow-x: hidden; overflow-y: auto; position: absolute; background-color: #FFFFFF;">
                <div>
                    <div style="display: block; width: 100%; height: 240px;">
                        <button style=" width: 100%; height: 100%; cursor: pointer; position: relative" onclick="window.open('${hotel["landingURL"]}', '_blank')">
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
                        <div class="section-subheader">
                            <h2 class="GLOBAL__gm2-subtitle-alt-1">简介</h2>
                            <div style="margin-top: 3px; margin-bottom: 0;">${hotelInfo["over_view"]}</div>
                        </div>
                    </div>
                </div></div>`;
    return pane
};

showHotelInfo = function (marker) {
    let hotelInfo = hotelInfos.get(marker["options"]["point_id"]);
    pane = packHotelInfo(marker["options"]["hotel"], hotelInfo);
    document.getElementById('featurelist-pane-hotel').innerHTML = pane;
};
