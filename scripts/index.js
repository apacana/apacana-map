requirejs.config({
    baseUrl: "scripts/lib",
    paths: {
        app: "../app"
    }
});

// 加载地图函数之后再加载主函数
requirejs(["leaflet-mapbox"], function() {
    document.querySelector(".spin").classList.add("is-none");
    requirejs(["app/main"]);
});
