let makeUserPrepareRequest = function() {
    console.log("userPrepare start");
    fetch(requestConfig.domain + requestConfig.userPrepare, {
        method: 'GET',
    }).then(response => console.log(response.json()));
    console.log("userPrepare end");
};

let makeGetUserInfoRequest = function() {
    console.log("getUserInfo start");
    fetch(requestConfig.domain + requestConfig.getUserInfo, {
        method: 'GET',
    }).then(response => console.log(response.json()));
    console.log("getUserInfo end");
};

define(function (require) {
    requestConfig = require("./request");

    makeUserPrepareRequest();
    makeGetUserInfoRequest();
    return {
    };
});