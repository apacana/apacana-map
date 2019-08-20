let makeUserPrepareRequest = function() {
    console.log("userPrepare start");
    fetch(requestConfig.domain + requestConfig.userPrepare, {
        method: 'GET',
    }).then(response => console.log(response.json()));
    console.log("userPrepare end");
};

define(function (require) {
    requestConfig = require("./request");

    makeUserPrepareRequest();
    return {
    };
});