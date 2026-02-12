
/* ========================================
   性能优化：使用立即执行函数，避免全局污染
   ======================================== */
(function() {
    'use strict';

    // 缓存DOM查询结果
    var cache = {
        elements: {},
        timers: {},
        get: function(selector) {
            if (!this.elements[selector]) {
                this.elements[selector] = document.querySelector(selector);
            }
            return this.elements[selector];
        },
        getAll: function(selector) {
            if (!this.elements[selector + '_all']) {
                this.elements[selector + '_all'] = document.querySelectorAll(selector);
            }
            return this.elements[selector + '_all'];
        },
        setTimer: function(name, callback, delay) {
            if (this.timers[name]) {
                clearTimeout(this.timers[name]);
            }
            this.timers[name] = setTimeout(callback, delay);
        },
        clearTimer: function(name) {
            if (this.timers[name]) {
                clearTimeout(this.timers[name]);
                delete this.timers[name];
            }
        }
    };

    // 性能监控
    var performanceMonitor = {
        startTime: Date.now(),
        metrics: {},
        
        mark: function(name) {
            if (window.performance && window.performance.mark) {
                window.performance.mark(name);
            }
            this.metrics[name] = Date.now() - this.startTime;
        },
        
        measure: function(name, startMark) {
            if (window.performance && window.performance.measure) {
                try {
                    window.performance.measure(name, startMark);
                } catch (e) {
                    console.warn('Performance measure failed:', e);
                }
            }
        }
    };

    // 优化的事件监听器
    var eventUtils = {
        // 使用事件委托减少监听器数量
        delegate: function(parent, selector, eventType, handler) {
            var parentEl = typeof parent === 'string' ? cache.get(parent) : parent;
            if (!parentEl) return;
            
            parentEl.addEventListener(eventType, function(e) {
                var target = e.target.closest(selector);
                if (target && parentEl.contains(target)) {
                    handler.call(target, e);
                }
            }, { passive: true });
        },
        
        // 防抖
        debounce: function(func, wait) {
            var timeout;
            return function executedFunction(...args) {
                var later = () => {
                    clearTimeout(timeout);
                    func.apply(this, args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // 节流
        throttle: function(func, limit) {
            var inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    };

    /*数值转换*/
    function castNum(num) {
        if (num < 100) {
            return num;
        } else if (num >= 1000 && num < 10000) {
            return (num / 1000).toFixed(1) + "K";
        } else if (num >= 10000 && num < 100000000) {
            return (num / 100000000).toFixed(2) + "W";
        } else if (num >= 100000000 && num < 10000000000000000) {
            return (num / 100000000).toFixed(2) + "E";
        } else {
            return "亿亿以上+";
        }
    }

    /*返回顶部 - 优化版本*/
    function initBackToTop() {
        var backTopBtn = cache.get('.backtop');
        if (!backTopBtn) return;

        var showHide = eventUtils.debounce(function() {
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > 200) {
                backTopBtn.style.display = 'block';
                backTopBtn.classList.add('show');
            } else {
                backTopBtn.classList.remove('show');
                setTimeout(function() {
                    if (!backTopBtn.classList.contains('show')) {
                        backTopBtn.style.display = 'none';
                    }
                }, 300);
            }
        }, 100);

        // 使用 passive 事件监听器提高滚动性能
        window.addEventListener('scroll', showHide, { passive: true });

        backTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // 初始检查
        showHide();
    }

    /*是否今天*/
    function isToday(date) {
        date = /\s*/.test(date) ? date.split(" ")[0] : date;
        var now = new Date();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var year = now.getFullYear();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (day >= 0 && day <= 9) {
            day = "0" + day;
        }
        var currentdate = year + "-" + month + "-" + day;
        return currentdate === date;
    }

    /*加载当前时间 - 优化版本*/
    function getTimeHtml() {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var hh = now.getHours();
        var mm = now.getMinutes();
        var ss = now.getSeconds();
        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;
        if (hh < 10) hh = "0" + hh;
        if (mm < 10) mm = "0" + mm;
        if (ss < 10) ss = "0" + ss;
        return "<span>" + month + "</span> <small>月</small> <span>" + day + "</span> <small>日</small> <small>" + hh + ":" + mm + ":" + ss + " 周" + "日一二三四五六".charAt(now.getDay()) + "</small>";
    }

    function updateTimeDisplay() {
        var timeElement = cache.get('.time');
        if (timeElement) {
            timeElement.innerHTML = getTimeHtml();
        }
    }

    // 初始化时间显示
    updateTimeDisplay();
    setInterval(updateTimeDisplay, 1000);

    /* 更新状态栏星期显示 */
    function updateWeekday() {
        var now = new Date();
        var weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        var weekdayElement = cache.get('#current-weekday');
        if (weekdayElement) {
            weekdayElement.textContent = weekdays[now.getDay()];
        }
    }

    /* 天气图标映射 */
    var weatherIcons = {
        '晴': 'weather-icon-sunny',
        '多云': 'weather-icon-cloudy',
        '阴': 'weather-icon-overcast',
        '雨': 'weather-icon-rainy',
        '小雨': 'weather-icon-rainy',
        '中雨': 'weather-icon-rainy',
        '大雨': 'weather-icon-rainy',
        '暴雨': 'weather-icon-rainy',
        '雪': 'weather-icon-snowy',
        '小雪': 'weather-icon-snowy',
        '中雪': 'weather-icon-snowy',
        '大雪': 'weather-icon-snowy',
        '雾': 'weather-icon-foggy',
        '霾': 'weather-icon-foggy'
    };

    function getWeatherIcon(condition) {
        return weatherIcons[condition] || 'weather-icon-sunny';
    }

    /* 获取天气图标SVG - 缓存版本 */
    var weatherIconCache = {};
    
    function getWeatherIconSvg(condition) {
        var iconClass = getWeatherIcon(condition);
        
        // 使用缓存
        if (weatherIconCache[iconClass]) {
            return weatherIconCache[iconClass];
        }
        
        var icons = {
            'weather-icon-sunny': '<svg class="weather-icon-sunny" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
            'weather-icon-cloudy': '<svg class="weather-icon-cloudy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>',
            'weather-icon-overcast': '<svg class="weather-icon-overcast" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><path d="M8 10a4 4 0 0 1 7.6-1.6"></path></svg>',
            'weather-icon-rainy': '<svg class="weather-icon-rainy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><line x1="8" y1="21" x2="8" y2="23"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="16" y1="21" x2="16" y2="23"></line></svg>',
            'weather-icon-snowy': '<svg class="weather-icon-snowy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><line x1="8" y1="21" x2="8" y2="23"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="16" y1="21" x2="16" y2="23"></line><line x1="10" y1="22" x2="10" y2="24"></line><line x1="14" y1="22" x2="14" y2="24"></line></svg>',
            'weather-icon-foggy': '<svg class="weather-icon-foggy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><line x1="8" y1="21" x2="16" y2="21"></line><line x1="6" y1="23" x2="18" y2="23"></line></svg>'
        };
        
        weatherIconCache[iconClass] = icons[iconClass] || icons['weather-icon-sunny'];
        return weatherIconCache[iconClass];
    }

    /* WMO天气代码映射到中文天气状况 */
    var weatherCodeMap = {
        0: '晴', 1: '晴', 2: '多云', 3: '阴', 45: '雾', 48: '雾',
        51: '小雨', 53: '小雨', 55: '小雨', 61: '小雨', 63: '中雨', 65: '大雨',
        66: '雨', 67: '雨', 71: '小雪', 73: '中雪', 75: '大雪', 77: '雪',
        80: '小雨', 81: '中雨', 82: '大雨', 85: '小雪', 86: '大雪',
        95: '雨', 96: '暴雨', 99: '暴雨'
    };
    
    function getWeatherCondition(code) {
        return weatherCodeMap[code] || '晴';
    }

    /* 更新天气信息 - 优化版本 */
    var lastWeatherUpdateTime = 0;
    var WEATHER_UPDATE_INTERVAL = 1800000; // 30分钟

    function updateWeather() {
        var now = Date.now();
        
        // 避免频繁更新
        if (now - lastWeatherUpdateTime < WEATHER_UPDATE_INTERVAL) {
            return;
        }
        
        lastWeatherUpdateTime = now;
        
        var weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=41.8057&longitude=123.4315&current_weather=true&timezone=Asia/Shanghai';
        
        $.ajax({
            url: weatherUrl,
            method: 'GET',
            timeout: 5000,
            cache: true, // 允许浏览器缓存
            success: function(data) {
                if (data && data.current_weather) {
                    var temperature = data.current_weather.temperature;
                    var weatherCode = data.current_weather.weathercode;
                    var condition = getWeatherCondition(weatherCode);
                    
                    var tempElement = cache.get('#current-temperature');
                    var weatherTextElement = cache.get('#current-weather-text');
                    var weatherIconElement = cache.get('#current-weather-icon');
                    
                    if (tempElement) {
                        tempElement.textContent = temperature + '℃';
                    }
                    
                    if (weatherTextElement) {
                        weatherTextElement.textContent = condition;
                    }
                    
                    if (weatherIconElement) {
                        weatherIconElement.innerHTML = getWeatherIconSvg(condition);
                    }
                }
            },
            error: function(xhr, status, error) {
                console.log('获取天气信息失败:', error);
            }
        });
    }

    /* 触摸设备检测 */
    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }

    /* 图片懒加载优化 */
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            var imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        var img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            var images = cache.getAll('img[data-src]');
            images.forEach(function(img) {
                imageObserver.observe(img);
            });
        }
    }

    /* 性能监控初始化 */
    function initPerformanceMonitoring() {
        if ('PerformanceObserver' in window) {
            try {
                var observer = new PerformanceObserver(function(list) {
                    var entries = list.getEntries();
                    entries.forEach(function(entry) {
                        console.log('[Performance]', entry.name, ':', entry.duration.toFixed(2) + 'ms');
                    });
                });
                observer.observe({ entryTypes: ['measure', 'navigation'] });
            } catch (e) {
                console.warn('Performance observer not supported');
            }
        }
    }

    /* 初始化所有功能 */
    function init() {
        performanceMonitor.mark('init-start');
        
        // 初始化返回顶部
        initBackToTop();
        
        // 初始化时间显示
        updateTimeDisplay();
        
        // 更新星期和天气
        updateWeekday();
        updateWeather();
        
        // 定时更新
        setInterval(updateWeekday, 3600000); // 每小时更新星期
        cache.setTimer('weather', updateWeather, WEATHER_UPDATE_INTERVAL); // 每30分钟更新天气
        
        // 初始化懒加载
        initLazyLoading();
        
        // 初始化性能监控
        initPerformanceMonitoring();
        
        // 检测触摸设备
        if (isTouchDevice()) {
            document.body.classList.add('touch-device');
        }
        
        performanceMonitor.mark('init-end');
        performanceMonitor.measure('init-total', 'init-start', 'init-end');
    }

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 暴露全局函数（兼容性）
    window.castNum = castNum;
    window.isToday = isToday;
    window.getTimeHtml = getTimeHtml;
    window.updateWeekday = updateWeekday;
    window.updateWeather = updateWeather;
    window.getWeatherIcon = getWeatherIcon;
    window.getWeatherIconSvg = getWeatherIconSvg;
    window.getWeatherCondition = getWeatherCondition;
    window.toggleDrawer = window.toggleDrawer || function() {
        var drawer = cache.get('#toolDrawer');
        if (drawer) {
            drawer.classList.toggle('open');
        }
    };

    // jQuery相关函数（兼容性）
    if (typeof $ !== 'undefined') {
        /*返回顶部（jQuery版本）*/
        if ($(".backtop").length > 0) {
            initBackToTop();
        }
        
        /*加载当前时间（jQuery版本）*/
        $(".time").html(getTimeHtml());
        setInterval(function () {
            $(".time").html(getTimeHtml());
        }, 1000);
    }

    /* AJAX 请求函数 */
    function request(option) {
        if (typeof option !== 'object') {
            console.warn("option is not a 'object'");
            return false;
        }
        if (typeof layer === 'undefined') {
            layui.use('layer', function() { ajx(true); });
        } else {
            ajx();
        }

        function ajx(o) {
            if (o) {
                layer = layui.layer;
            }
            $.ajax({
                url: option.url || location.pathname,
                data: option.data || null,
                dataType: option.dataType || 'JSON',
                type: option.type || 'post',
                async: typeof option.async === 'boolean' ? option.async : true,
                cache: option.cache !== false,
                success: option.success || function (res) {
                    if (res && res.data) {
                        var delay = res.data.delay || 0;
                        delay && (delay *= 1000);
                        res.data.redirect && (setTimeout(function () {
                            location = res.data.redirect;
                        }, delay));
                        res.data.reload && (option.reload = parseFloat(res.data.reload));
                        if (res.data.alert) {
                            res.msg && layer.open({
                                type: 0,
                                shadeClose: true,
                                shade: ["0.6", "#7186a5"],
                                skin: 'atuikeLayerSkin1',
                                content: res.msg
                            });
                        }
                    }
                    if (!res.data || !res.data.alert) {
                        var cfg = typeof res.data.icon !== "boolean" ? {
                            icon: (res.code || 0),
                            offset: '20%'
                        } : {};
                        res.msg && layer.msg(res.msg, cfg);
                    }
                    option.done && option.done(res);
                },
                complete: function () {
                    setTimeout(function () {
                        var ret = option.reload || false;
                        if (ret) {
                            ret = (typeof ret === 'number') ? ret : 0;
                            setTimeout(function () {
                                location.reload();
                            }, ret * 1000);
                        }
                    }, 10);
                },
                error: option.error || function (e) {
                    layer.msg('网络异常:' + (e.statusText || e.statusMessage));
                }
            });
        }
    }

    // 扩展jQuery
    if (typeof $ !== 'undefined') {
        $.fn.field = function () {
            var arr_data = $(this).serializeArray();
            var formData = {};
            if (arr_data.length > 0) {
                arr_data.forEach(function (item) {
                    formData[item.name] = item.value;
                });
            }
            return formData;
        };
    }

    /* Cookie 函数 */
    function getCookie(name) {
        var dc = document.cookie;
        var prefix = name + "=";
        var begin = dc.indexOf("; " + prefix);
        if (begin === -1) {
            begin = dc.indexOf(prefix);
            if (begin !== 0) return null;
        } else {
            begin += 2;
        }
        var end = document.cookie.indexOf(";", begin);
        if (end === -1) {
            end = dc.length;
        }
        return decodeURIComponent(dc.substring(begin + prefix.length, end));
    }

    function setCookie(name, value, time) {
        var strsec = getsec(time);
        var exp = new Date();
        exp.setTime(exp.getTime() + strsec);
        document.cookie = name + "=" + encodeURIComponent(value) + "; path=/;expires=" + exp.toGMTString() + "; SameSite=Lax";
    }

    function getsec(str) {
        var str1 = str.substring(1, str.length) * 1;
        var str2 = str.substring(0, 1);
        if (str2 === "s") {
            return str1 * 1000;
        } else if (str2 === "h") {
            return str1 * 60 * 60 * 1000;
        } else if (str2 === "d") {
            return str1 * 24 * 60 * 60 * 1000;
        }
        return 0;
    }

    // 扩展Array原型
    if (!Array.prototype.ArrDelVal) {
        Array.prototype.ArrDelVal = function (val) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == val) {
                    this.splice(i, 1);
                    break;
                }
            }
        };
    }

    // 暴露全局函数
    window.request = request;
    window.getCookie = getCookie;
    window.setCookie = setCookie;
    window.getsec = getsec;

})();