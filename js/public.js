
/*数值转换*/
function castNum(num) {
    if (num < 100) {
        return num;
    } else if (num >= 1000 && num < 10000) {
        var newNum = (num / 1000).toFixed(1) + "K";
        return newNum;
    } else if (num >= 10000 && num < 100000000) {
        var newNum = (num / 100000000).toFixed(2) + "W";
        return newNum;
    } else if (num >= 100000000 && num < 10000000000000000) {
        var newNum = (num / 100000000).toFixed(2) + "E";
        return newNum;
    } else {
        var newNum = "亿亿以上+";
        return newNum;
    }
} 
/*返回顶部*/
if ($(".backtop").length > 0) {
    if ($(document).scrollTop() > 200) {
        $(".backtop").show();
    } else {
        $(".backtop").hide();
    }
    $(document).scroll(function (e) {
        if ($(this).scrollTop() > 200) {
            $(".backtop").show();
        } else {
            $(".backtop").hide();
        }
    });
    $(".backtop").click(function () {
        $('html,body').animate({
            scrollTop: 0
        }, 'slow');
    });
} /*是否今天*/
function isToday(date) {
    date = /\s*/.test(date) ? date.split(" ")[0] : date;
    var now = new Date();
    var seperator1 = "-";
    var month = now.getMonth() + 1;
    var strDate = now.getDate();
    var year = now.getFullYear();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate === date;
} /*加载当前时间*/
$(".time").html(getTimeHtml());
setInterval(function () {
    $(".time").html(getTimeHtml());
}, 1000); /*获取当前时间段*/
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
    return "<span>" + month + "</span> <small>月</small> <span>" + day + "</span> <small>日</small> <small>" + hh + ":" + mm + ":" + ss + " 周" + "日一二三四五六".charAt(new Date().getDay()) + "</small>";
}

function request(option) {
    if (typeof (option) !== 'object') {
        console.warn("option is not a 'object'");
        return false;
    }
    if (typeof (layer) === 'undefined') {
        layui.use('layer', ajx(true));
    } else {
        ajx();
    }
    if (typeof (option.loading) !== 'boolean') {}

    function ajx(o) {
        if (o) {
            layer = layui.layer;
        }
        $.ajax({
            url: option.url || location.pathname,
            data: option.data || null,
            dataType: option.dataType || 'JSON',
            type: option.type || 'post',
            async: typeof (option.async) === 'boolean' ? option.async : true,
            success: option.success || function (res) {
                if (res.data) {
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
                    var cfg = typeof (res.data.icon) !== "boolean" ? {
                        icon: (res.code || 0),
                        offset: '20%'
                    } : {};
                    res.msg && layer.msg(res.msg, cfg);
                }
                option.done && option.done(res);
            },
            complete: function () {
                if (typeof (option.loading) !== 'boolean') {}
                setTimeout(function () {
                    var ret = option.reload || false;
                    if (ret) {
                        ret = (typeof (ret === 'number')) ? ret : 0;
                        setTimeout(function () {
                            location.reload();
                        }, ret * 1000);
                    }
                }, 10);
            },
            error: option.error || function (e) {
                layer.msg('网络异常:' + e.statusText || e.statusMessage);
            }
        });
    }
}
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

function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null
    } else {
        begin += 2
    }
    var end = document.cookie.indexOf(";", begin);
    if (end == -1) {
        end = dc.length
    }
    return unescape(dc.substring(begin + prefix.length, end))
}

function setCookie(name, value, time) {
    var strsec = getsec(time);
    var exp = new Date();
    exp.setTime(exp.getTime() + strsec * 1);
    document.cookie = name + "=" + escape(value) + "; path=/;expires=" + exp.toGMTString();
}

function getsec(str) {
    var str1 = str.substring(1, str.length) * 1;
    var str2 = str.substring(0, 1);
    if (str2 == "s") {
        return str1 * 1000;
    } else if (str2 == "h") {
        return str1 * 60 * 60 * 1000;
    } else if (str2 == "d") {
        return str1 * 24 * 60 * 60 * 1000;
    }
}
Array.prototype.ArrDelVal = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) {
            this.splice(i, 1);
            break;
        }
    }
};

/* 更新状态栏星期显示 */
function updateWeekday() {
    var now = new Date();
    var weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    var weekday = weekdays[now.getDay()];
    var weekdayElement = document.getElementById('current-weekday');
    if (weekdayElement) {
        weekdayElement.textContent = weekday;
    }
}

/* 天气图标映射 */
function getWeatherIcon(condition) {
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
    
    // 默认返回晴天图标
    return weatherIcons[condition] || 'weather-icon-sunny';
}

/* 获取天气图标SVG */
function getWeatherIconSvg(condition) {
    var iconClass = getWeatherIcon(condition);
    
    var icons = {
        'weather-icon-sunny': '<svg class="weather-icon-sunny" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
        'weather-icon-cloudy': '<svg class="weather-icon-cloudy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>',
        'weather-icon-overcast': '<svg class="weather-icon-overcast" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><path d="M8 10a4 4 0 0 1 7.6-1.6"></path></svg>',
        'weather-icon-rainy': '<svg class="weather-icon-rainy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><line x1="8" y1="21" x2="8" y2="23"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="16" y1="21" x2="16" y2="23"></line></svg>',
        'weather-icon-snowy': '<svg class="weather-icon-snowy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><line x1="8" y1="21" x2="8" y2="23"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="16" y1="21" x2="16" y2="23"></line><line x1="10" y1="22" x2="10" y2="24"></line><line x1="14" y1="22" x2="14" y2="24"></line></svg>',
        'weather-icon-foggy': '<svg class="weather-icon-foggy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><line x1="8" y1="21" x2="16" y2="21"></line><line x1="6" y1="23" x2="18" y2="23"></line></svg>'
    };
    
    return icons[iconClass] || icons['weather-icon-sunny'];
}

/* 更新天气信息 */
function updateWeather() {
    // 使用 Open-Meteo 免费天气API（沈阳）
    // 沈阳坐标：纬度 41.8057, 经度 123.4315
    var weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=41.8057&longitude=123.4315&current_weather=true&timezone=Asia/Shanghai';
    
    $.ajax({
        url: weatherUrl,
        method: 'GET',
        timeout: 5000,
        success: function(data) {
            if (data && data.current_weather) {
                var temperature = data.current_weather.temperature;
                var weatherCode = data.current_weather.weathercode;
                var condition = getWeatherCondition(weatherCode);
                
                // 更新温度和天气状况
                var tempElement = document.getElementById('current-temperature');
                var weatherTextElement = document.getElementById('current-weather-text');
                var weatherIconElement = document.getElementById('current-weather-icon');
                
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
            // 保持默认值不变
        }
    });
}

/* WMO天气代码映射到中文天气状况 */
function getWeatherCondition(code) {
    var weatherMap = {
        0: '晴',           // Clear sky
        1: '晴',           // Mainly clear
        2: '多云',         // Partly cloudy
        3: '阴',           // Overcast
        45: '雾',          // Fog
        48: '雾',          // Depositing rime fog
        51: '小雨',        // Light drizzle
        53: '小雨',        // Moderate drizzle
        55: '小雨',        // Dense drizzle
        61: '小雨',        // Slight rain
        63: '中雨',        // Moderate rain
        65: '大雨',        // Heavy rain
        66: '雨',          // Light freezing rain
        67: '雨',          // Heavy freezing rain
        71: '小雪',        // Slight snow fall
        73: '中雪',        // Moderate snow fall
        75: '大雪',        // Heavy snow fall
        77: '雪',          // Snow grains
        80: '小雨',        // Slight rain showers
        81: '中雨',        // Moderate rain showers
        82: '大雨',        // Violent rain showers
        85: '小雪',        // Slight snow showers
        86: '大雪',        // Heavy snow showers
        95: '雨',          // Thunderstorm
        96: '暴雨',        // Thunderstorm with slight hail
        99: '暴雨'         // Thunderstorm with heavy hail
    };
    
    return weatherMap[code] || '晴';
}

// 页面加载时更新星期和天气
$(document).ready(function() {
    updateWeekday();
    updateWeather();
    
    // 每小时更新一次星期（3600000毫秒）- 确保跨天后日期正确
    setInterval(updateWeekday, 3600000);
    
    // 每30分钟更新一次天气（1800000毫秒）
    setInterval(updateWeather, 1800000);
});