let makeUserPrepareRequest = function() {
    fetch(requestConfig.domain + requestConfig.userPrepare, {
        credentials: 'include',
        method: 'GET',
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
        console.log(data)
        // todo: 数据存储
    }).catch(function(e) {
        console.log("makeGetUserInfoRequest error");
    });
};

define(function (require) {
    requestConfig = require("./request");

    makeUserPrepareRequest();
    makeGetUserInfoRequest();
    return {
    };
});