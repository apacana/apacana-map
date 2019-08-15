requirejs.config({
    baseUrl: "scripts/lib",
    paths: {
        app: "../app"
    }
});

// 加载地图函数之后再加载主函数
requirejs(["leaflet"], function() {
    // @TODO 以后可以加一点动画特效
    requirejs(["app/main"]);
});
