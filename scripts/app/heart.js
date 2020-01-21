map = null;
oldLat = 39.908898;
oldLon = 116.394293;
oldZoom = 13;

heartBeat = async function (mapBox) {
    map = mapBox;
    while (true) {
        await sleep(10000);
        if (mapBox._lastCenter.lat !== oldLat || mapBox._lastCenter.lng !== oldLon || mapBox._zoom !== oldZoom) {
            // 发送心跳数据更新经纬度
            fetch(requestConfig.domain + requestConfig.userHeart, {
                credentials: 'include',
                method: 'POST',
                body: '{"latitude": ' + map._lastCenter.lat + ',' +
                    '"longitude": ' + map._lastCenter.lng + ',' +
                    '"zoom": ' + map._zoom + '}',
            }).then(response => {
                return response.json();
            }).then(data => {
                console.log(data);
                if (data.code !== 0) {
                    console.log("userHeart failed, code:", data.code);
                } else {
                    oldLat = map._lastCenter.lat;
                    oldLon = map._lastCenter.lng;
                    oldZoom = map._zoom;
                }
            }).catch(function(e) {
                console.log("userHeart error", e);
            });
        }
    }
};

setCenter = function (lat, lon, zoom) {
    if (map !== null) {
        map.setView([lat,lon], zoom);
        oldLat = lat;
        oldLon = lon;
        oldZoom = zoom;
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}