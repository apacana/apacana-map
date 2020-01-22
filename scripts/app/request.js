define(function () {
    return {
        domain: "http://localhost:8899",
        userPrepare: "/api/user/prepare/",
        getUserInfo: "/api/user/info/",
        userHeart: "/api/user/heart/",

        addPoint: "/api/point/add/",
        deletePoint: "/api/point/delete/",

        addStroke: "/api/stroke/create/",
        updateStroke: "/api/stroke/update/",

        addRoute: "/api/route/create/",
        getRouteInfo: "/api/route/",
        closeRoute: "/api/route/close/",
        openRoute: "/api/route/open/",
        addRoutePoint: "/api/route/add_point/",
        updateDirection: "/api/route/update_direction/",
        updateRoute: "/api/route/update/",
        removeRoutePoint: "/api/route/remove_point/",

        searchHotel: "/api/hotel/agoda/search/",
        getHotel: "/api/hotel/agoda/get/",
        hotelBooking: "/api/hotel/agoda/booking/",

        searchFood: "/api/food/yelp/search/",
        getFoodInfo: "/api/food/yelp/",

        mapBoxDirectionsDomain: "https://api.mapbox.com/directions/v5/",
        mapBoxGeocodingDomain: "https://api.mapbox.com/geocoding/v5/",
    };
});