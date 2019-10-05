define(function () {
    return {
        domain: "http://localhost:8899",
        userPrepare: "/api/user/prepare/",
        getUserInfo: "/api/user/info/",
        addPoint: "/api/point/add/",
        addStroke: "/api/stroke/create/",
        addRoute: "/api/route/create/",
        getRouteInfo: "/api/route/",
        closeRoute: "/api/route/close/",
        openRoute: "/api/route/open/",
        addRoutePoint: "/api/route/add_point/",
        updateDirection: "/api/route/update_direction/",
        searchHotel: "/api/hotel/agoda/search/",
        getHotel: "/api/hotel/agoda/get/",
        hotelBooking: "/api/hotel/agoda/booking/",

        mapBoxDomain: "https://api.mapbox.com/directions/v5/",
    };
});