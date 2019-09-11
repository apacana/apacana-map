userInfoMem = "";
defaultStroke = null;

let makeUserPrepareRequest = function() {
    fetch(requestConfig.domain + requestConfig.userPrepare, {
        credentials: 'include',
        method: 'GET',
    }).then(function (res) {
        if (res.ok) {
            return makeGetUserInfoRequest();
        }
    }).catch(function(e) {
        console.log("makeUserPrepareRequest error");
    });
};

let makeGetUserInfoRequest = function() {
    fetch(requestConfig.domain + requestConfig.getUserInfo, {
        credentials: 'include',
        method: 'GET',
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data.code !== 0) {
            console.log("makeGetUserInfoRequest failed, code:", data.code);
        } else {
            userInfoMem = data.data;
            console.log(userInfoMem);
            if (data.data["strokes_info"] == null) {
                // 没有行程信息
                let pane = "<div id=\"featurelist-titlebar-container\" style=\"height: 763px\">\n" +
                    "                    <div id=\"featurelist-title-bar\" class=\"featurelist-title-barClass\">\n" +
                    "                        <div id=\"map-title-desc-bar\">\n" +
                    "                            <div style=\"padding: 300px 32px;\">\n" +
                    "                                <div style=\"padding-left: 53px; padding-right: 53px;\">\n" +
                    "                                    <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" style=\"height: 101px; width: 101px; fill: #cdcdcd; cursor: pointer\"\n" +
                    "                                         onmouseover=\"this.style.fill='#444444'\" onmouseout=\"this.style.fill='#cdcdcd'\" onclick=\"console.log('todo: 添加行程')\">\n" +
                    "                                        <g>\n" +
                    "                                            <path fill=\"none\" d=\"M0 0h24v24H0z\"/>\n" +
                    "                                            <path d=\"M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5zm6 6V7h2v4h4v2h-4v4h-2v-4H7v-2h4z\"/>\n" +
                    "                                        </g>\n" +
                    "                                    </svg>\n" +
                    "                                </div>\n" +
                    "                                <div id=\"map-title-desc-bar-name\" class=\"map-title-desc-bar-nameClass\" style=\"width: 207px; height: 23px; text-align: center\">立即创建属于你的行程</div>\n" +
                    "                            </div>\n" +
                    "                        </div>\n" +
                    "                    </div>\n" +
                    "                </div>";
                if (document.getElementById('featurelist-pane')) {
                    document.getElementById('featurelist-pane').innerHTML = pane;
                } else {
                    console.log("getElementById featurelist-pane failed");
                }
            } else {
                setUserMarket(data.data["strokes_info"]["default_stroke"]["point_list"]);
                let pane = bindStrokeInfo(data.data["strokes_info"]);
                if (document.getElementById('featurelist-pane')) {
                    document.getElementById('featurelist-pane').innerHTML = pane;
                } else {
                    console.log("getElementById featurelist-pane failed");
                }
            }
            console.log(defaultStroke);
        }
    }).catch(function(e) {
        console.log("makeGetUserInfoRequest error:", e);
    });
};

let bindStrokeInfo = function(strokeList) {
    let pane;
    pane = "<div id=\"featurelist-titlebar-container\">\n" +
        "                    <div id=\"featurelist-title-bar\" class=\"featurelist-title-barClass\">\n" +
        "                        <div id=\"map-action-menu\" class=\"map-action-menuClass\"></div>\n" +
        "                        <div id=\"map-title-desc-bar\">\n" +
        "                            <div id=\"map-title-desc-bar-name\" class=\"map-title-desc-bar-nameClass\">default itinerary</div>\n" +
        "                            <div id=\"map-title-desc-bar-time\" class=\"map-title-desc-bar-timeClass\">\n" +
        "                                <div>上次修改时间: " + strokeList["default_stroke"]["update_time"] + "</div>\n" +
        "                            </div>\n" +
        "                        </div>\n" +
        "                        <ul class=\"map-actionClass\">\n" +
        "                            <div style=\"height: 16px\"></div>\n" +
        "                        </ul>\n" +
        "                    </div>\n" +
        "                </div>\n" +
        "                <div id=\"featurelist-scrollable-container\" style=\"max-height: 625px; max-width: 307px; overflow-x: hidden; overflow-y: auto\">\n" +
        "                    <div class=\"stroke-info\">\n" +
        "                        <div class=\"point-list\" style=\"position: relative\">\n" +
        "                            <div class=\"point-list-layer\">\n" +
        "                                <div class=\"point-list-layer-header\">\n" +
        "                                    <div class=\"point-list-layer-header-font\">行程点集</div>\n" +
        "                                </div>\n" +
        "                                <div class=\"point-list-layer-body\">\n" +
        "                                    <div class=\"point-list-layer-body-container\">";

    for(let point of strokeList["default_stroke"]["point_list"]) {
        pane += "<div class=\"point-list-layer-body-item\">\n" +
            "                                            <div class=\"point-logo\">\n" +
            "                                                <div class=\"point-logo-svg\" style=\"background-image:url(https://mt.google.com/vt/icon/name=icons/onion/SHARED-mymaps-pin-container_4x.png,icons/onion/1899-blank-shape_pin_4x.png&highlight=0288D1,ff000000&scale=2.0); background-position:center; background-size:contain;\" iconcode=\"1899-0288D1\"></div>\n" +
            "                                            </div>\n" +
            "                                            <div class=\"point-font-container\">\n" +
            "                                                <div class=\"point-font\" onclick=''>" + point["text"] + "</div>\n" +
            "                                            </div>\n" +
            "                                        </div>"
    }

    pane += "</div>\n" +
        "                                </div>\n" +
        "                            </div>\n" +
        "                        </div>\n" +
        "                        <div class=\"point-list\" style=\"position: relative\">\n" +
        "                            <div class=\"point-list-layer\">\n" +
        "                                <div class=\"point-list-layer-header\">\n" +
        "                                    <div class=\"point-list-layer-header-font\">行程路线集</div>\n" +
        "                                </div>\n" +
        "                            </div>\n" +
        "                        </div>\n" +
        "                        <ul class=\"map-actionClass\">\n" +
        "                            <div style=\"height: 0\"></div>\n" +
        "                        </ul>\n" +
        "                        <div class=\"point-list\" style=\"position: relative\">\n" +
        "                            <div class=\"point-list-layer\">\n" +
        "                                <div class=\"point-list-layer-header\">\n" +
        "                                    <div class=\"point-list-layer-header-font\">历史行程</div>\n" +
        "                                </div>\n" +
        "                            </div>\n" +
        "                        </div>\n" +
        "                    </div>\n" +
        "                </div>";

    return pane
};

define(function (require) {
    requestConfig = require("./request");

    makeUserPrepareRequest();
    return {
    };
});
