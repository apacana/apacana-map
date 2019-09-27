// 留白
hotelMarker = [];
liveHotel = "";

searchNearHotel = function (e) {
    console.log("searchNearHotel:", e);

    let url = `https://sherpa.agoda.com/Affiliate/FetchHotelsV2?refKey=WHmVY%2BEwqwInzKYu3N907g%3D%3D&apiRequest.criteria.additional.language=zh-cn&apiRequest.criteria.additional.discountOnly=false&apiRequest.criteria.additional.currency=CNY&apiRequest.criteria.checkInDate=2019-12-09&apiRequest.criteria.checkOutDate=2019-12-10&apiRequest.criteria.geo.latitude=${e.latlng.lat}&apiRequest.criteria.geo.longitude=${e.latlng.lng}&apiRequest.criteria.geo.searchRadius=10&apiRequest.criteria.additional.occupancy.numberOfRoom=1&apiRequest.criteria.additional.occupancy.numberOfAdult=2&apiRequest.criteria.additional.occupancy.numberOfChildren=0&apiRequest.criteria.additional.maxResult=30&cid=1831827`;
    console.log(url);

    // let xmlHttp = new XMLHttpRequest();
    // xmlHttp.open("GET", url);
    // xmlHttp.setRequestHeader("Referer", "https://sherpa.agoda.com");
    // xmlHttp.send();
    // xmlHttp.onreadystatechange = (e)=> {
    //     console.log("body:", xmlHttp.responseText);
    // };

    // fetch(url, {
    //     // credentials: 'include',
    //     method: 'GET',
    //     mode: "no-cors",
    //     // headers: {
    //     //     "Accept": "application/json"
    //     // }
    // }).then(response => {
    //     console.log(response, response.body);
    //     return response.json();
    // }).then(data => {
    //     console.log("body:", data);
    // }).catch(function(e) {
    //     console.log("searchNearHotel error:", e);
    // });

    let marker = L.marker([-360, -360], {icon: addIcon(L.mapbox, 'building'), point_id: "", point_type: "", point_token: "", text: ""});
    let lat = e.latlng.lat;
    let lon = e.latlng.lng;
    marker.addTo(map);
    marker.setLatLng([lat, lon]);
    marker.bindPopup(userMarketPopup("test", "test_place_name", lat, lon), popupOption);
};

searchCallBack = function () {

};

addHotelMarker = function () {

};
