// 英文字符长度为 1，中文为 2
let gblen = function(str) {
    let len = 0;  
    for (let i = 0; i < str.length; i++) {  
        if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {  
            len += 2;  
        } else {  
            len += 1;  
        }  
    }  
    return len;  
}

// 函数防抖
let debounce = function (fnc, delay, search) {
    return function() {
        clearTimeout(search);

        let context = this;
        search = setTimeout(function () {
            fnc.apply(context);
        }, delay);
    };
};

// 侵入后：
// 1. 4 字符长度以下不会触发自动搜索，且关闭搜索提示
// 2. 能够触发搜索中状态
let autocomplete = function () {
    let val = this._input.value;

    if (gblen(val) < 4) return this._updateAutocomplete(false)();

    L.DomUtil.addClass(this._container, 'searching');
    this.geocoder.query(L.Util.extend({
        query: val,
        proximity: this.options.proximity ? this._map.getCenter() : false
    }, this.options.queryOptions), this._updateAutocomplete(false));
}

// 侵入后：
// 1. 能够取消搜索中状态
// 2. @TODO 更明显的搜索无结果显示(应由外层处理，通过 notfound 传递出去)
let updateAutocomplete = function (jump) {
    let that = this;

    return function (err, resp) {
        L.DomUtil.removeClass(that._container, 'searching');

        that.states.search = null;
        that._results.innerHTML = '';
        
        if (err || !resp) {
            that.fire('error', {error: err});
        } else {
            var features = [];
            if (resp.results && resp.results.features) {
                features = resp.results.features;
            }
            if (features.length) {
                that.fire('found', {results: resp.results});

                // 如果需要跳转，自动跳转第一个
                // 用于回车触发的 submit 事件中
                if (jump) {
                    that._chooseResult(features[0]);
                    that.fire('select', { feature: features[0] });
                }
            } else {
                that.fire('notfound');
            }
            that.states.results = features;
            that._displayResults(features);

       }
    }
}

// 侵入后：
// 1. 如果已有最新数据，将会自动跳转到第一个位置
// 2. 若最新数据长度为 0 ，发送 notfound 事件
// 3. 若没有最新数据，撤销正在等待的搜索，立即发送搜索，并跳转第一个位置
let geocode = function (e) {
    L.DomEvent.preventDefault(e);
    // 说明是最新的数据可以直接使用
    if (this.states.search == null) {
        // 与搜索一样，发送没有数据的事件，交由外层处理
        if (this.states.results == 0) {
            that.fire('notfound');
        } else {
            this._chooseResult(this.states.results[0]);
            this.fire('select', { feature: this.states.results[0] });
        }
    } else {
        clearTimeout(this.states.search);

        L.DomUtil.addClass(this._container, 'searching');
        this.geocoder.query(L.Util.extend({
            query: val,
            proximity: this.options.proximity ? this._map.getCenter() : false
        }, this.options.queryOptions), this._updateAutocomplete(true));
    }
}

// 侵入后：
// 1. keyup 事件改为函数防抖下的自动搜索
// 2. submit 事件改为特殊的选中第一个
// 3. 输入框状态可以由 icon 表现
let onAdd = function (map) {
    var container = L.DomUtil.create('div', 'leaflet-control-mapbox-geocoder leaflet-bar leaflet-control'),
        link = L.DomUtil.create('a', 'leaflet-control-mapbox-geocoder-icon mapbox-icon mapbox-icon-geocoder', container),
        results = L.DomUtil.create('div', 'leaflet-control-mapbox-geocoder-results', container),
        wrap = L.DomUtil.create('div', 'leaflet-control-mapbox-geocoder-wrap', container),
        form = L.DomUtil.create('form', 'leaflet-control-mapbox-geocoder-form', wrap),
        input = L.DomUtil.create('input', '', form);

    link.href = '#';
    link.innerHTML = '&nbsp;';

    input.type = 'text';
    input.setAttribute('placeholder', 'Search');

    L.DomEvent.on(form, 'submit', this._geocode, this);
    L.DomEvent.on(input, 'keyup', debounce(this._autocomplete, 500, this.states.search), this);
    L.DomEvent.disableClickPropagation(container);

    // 输入框状态可以由 icon 表现
    L.DomEvent.on(input, "focus", function () {
        L.DomUtil.addClass(link, "is-active");
    });
    L.DomEvent.on(input, "blur", function () {
        L.DomUtil.removeClass(link, "is-active");
    });

    this._map = map;
    this._results = results;
    this._input = input;
    this._form = form;

    return container;
};

define(function () {
    let geoControl = L.mapbox.GeocoderControl.prototype; 

    geoControl.states = { search: null, results: [] };

    // 侵入各个函数使得更加符合要求
    geoControl._autocomplete = autocomplete;
    geoControl._updateAutocomplete = updateAutocomplete;
    geoControl._geocode = geocode;
    geoControl.onAdd = onAdd;
});
