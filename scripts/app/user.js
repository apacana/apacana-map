userInfoMem = null;
defaultStroke = null;
lastRoute = "";
mainPrint = false;
routeInfoMap = new Map();

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
                let pane = `<div id="featurelist-titlebar-container" style="height: 763px">
                                    <div id="featurelist-title-bar" class="featurelist-title-barClass">
                                            <div id="map-title-desc-bar">
                                                <div style="padding: 300px 32px;">
                                                    <div style="padding-left: 53px; padding-right: 53px;">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="height: 101px; width: 101px; fill: #cdcdcd; cursor: pointer"
                                                             onmouseover="this.style.fill='#444444'" onmouseout="this.style.fill='#cdcdcd'" onclick="addFirstStroke()">
                                                            <g>
                                                                <path fill="none" d="M0 0h24v24H0z"/>
                                                                <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5zm6 6V7h2v4h4v2h-4v4h-2v-4H7v-2h4z"/>
                                                            </g>
                                                        </svg>
                                                    </div>
                                                    <div id="map-title-desc-bar-name" class="map-title-desc-bar-nameClass" style="width: 207px; height: 23px; text-align: center">立即创建属于你的行程</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`;
                if (document.getElementById('featurelist-pane')) {
                    document.getElementById('featurelist-pane').innerHTML = pane;
                } else {
                    console.log("getElementById featurelist-pane failed");
                }
            } else {
                defaultStroke = data.data["strokes_info"]["default_stroke"];
                setUserMarket(data.data["strokes_info"]["default_stroke"]["point_list"]);
                mainPrint = true;
                let pane = bindStrokeInfo(data.data["strokes_info"]);
                if (document.getElementById('featurelist-pane')) {
                    document.getElementById('featurelist-pane').innerHTML = pane;
                } else {
                    console.log("getElementById featurelist-pane failed");
                }
                mainPrint = false;
            }
            console.log(defaultStroke);
        }
    }).catch(function(e) {
        console.log("makeGetUserInfoRequest error:", e);
    });
};

define(function (require) {
    requestConfig = require("./request");
    require("./stroke");

    makeUserPrepareRequest();
    return {
    };
});
