;
(function(win) { //抽奖转盘
    function lottery() {
        var that = this;
        that.extendConfig = null;
        that.init.apply(that, arguments);
        that.device();
    }

    lottery.prototype = {
        playnum: 0,
        clickTag: false,
        index: -1, //当前转动到哪个位置，起点位置
        count: 0, //总共有多少个位置
        timer: 0, //setTimeout的ID，用clearTimeout清除
        speed: 20, //初始转动速度
        times: 0, //转动次数
        cycle: 50, //转动基本次数：即至少需要转动多少次再进入抽奖环节
        prize: -1, //中奖位置
        selector: '', //选择器
        notWin: 7, //空奖的值
        slowMotion: 10, //开奖最后阶段的渐慢动作个数
        init: function(id) { //程序初始化
            var that = this,
                args = Array.prototype.slice.call(arguments, 0),
                config = args[0],
                getType = Object.prototype.toString,
                defaultConfig = {
                    id: '#lottery', //控件id
                    awardsSelector: '.lottery-unit', //奖项选择器
                    omg: function() {

                    }
                };
            that.extendConfig = that.util.extend({}, config, defaultConfig) //模拟jquery的$.extend;
        },
        device: function() {
            var that = this,
                Objs = that.extendConfig;
            $selector = $(Objs.id),
                $units = $selector.find(Objs.awardsSelector);
            if ($units.length > 0) {
                that.selector = $selector;
                that.count = $units.length;
                $selector.find(Objs.awardsSelector + "-" + this.index).addClass("active");
            }
            Objs.loadingGet.call(null, this); //插件加载完成后初始化自定义
            Objs.setmyjiangpin.call(null); //目前获得的奖品
            that.onClick(); //绑定抽奖点击按钮事件
        },
        roll: function() { //转动实例
            var that = this;
            //初始化
            var index = that.index,
                count = that.count,
                selector = that.extendConfig.id;
            $(selector).find(that.extendConfig.awardsSelector + "-" + index).removeClass("active");
            index += 1;
            if (index > count - 1) {
                index = 0;
            }
            $(selector).find(that.extendConfig.awardsSelector + "-" + index).addClass("active");
            that.index = index;

            //开始转动
            that.times += 1;
            if (that.times > that.cycle + that.slowMotion && that.prize == that.index) { //当转动次数 > 转动基本次数+10 && 中奖位置 == 当前转动到的位置  
                clearTimeout(that.timer); //停止转动
                that.prize = -1; //中奖设置为默认参数
                that.times = 0; //转动次数设置为默认参数
                that.clickTag = false; //解锁点击抽奖按钮
            } else { //执行转动
                //console.log(that.times, that.cycle, that.speed, that.prize, that.index);
                if (that.times < that.cycle) {
                    that.speed = 40;
                } else if (that.times == that.cycle) {
                    that.extendConfig.winElart.call(null, that);
                } else {
                    if (that.times > that.cycle + 10 && ((that.prize == 0 && that.index == 7) || that.prize == that.index + 1)) {
                        that.speed += 110;
                    } else {
                        that.speed += 20;
                    }
                }
                if (that.speed < 40) {
                    that.speed = 40;
                }
                that.timer = setTimeout(function() { that.roll(); }, that.speed); //循环调用
            }
            return false;
        },
        onClick: function() {
            var that = this;
            $(that.extendConfig.drawButton).on('click', function() {
                if (that.extendConfig.isLogin()) { //已登录
                    if (that.clickTag) { //click控制一次抽奖过程中不能重复点击抽奖按钮，后面的点击不响应
                        return false;
                    } else {
                        //过程不响应click事件，会将clickTag置为false
                        that.clickTag = true; //一次抽奖完成后，设置clickTag为true，可继续抽奖
                        if (that.playnum <= 0) { //当抽奖次数为0的时候执行
                            that.extendConfig.nanNum.call(null);
                        } else { //还有次数就执行
                            that.extendConfig.okNum.call(null, that);
                        }
                    }
                } else { //未登录
                    alert('未登录!');
                }
            });


        },
        util: {
            extend: function(o, config, defaultConfig) {
                var self = this;
                if (Object.prototype.toString.call(config) == '[object Undefined]') {
                    for (var name in defaultConfig) {
                        if (typeof defaultConfig[name] === "object") {
                            o[name] = (defaultConfig[name].constructor === Array) ? [] : {}; //我们让要复制的对象的name项=数组或者是json
                            self.extend(o[name], config, defaultConfig[name]); //然后来无限调用函数自己 递归思想
                        } else {
                            o[name] = defaultConfig[name]; //如果不是对象，直接等于即可，不会发生引用。            
                        }
                    }
                    return o; //然后在把复制好的对象给return出去
                } else {
                    for (var name in defaultConfig) {
                        if (defaultConfig.hasOwnProperty(name) && (!config.hasOwnProperty(name))) {
                            if (typeof defaultConfig[name] === "object") {
                                config[name] = (defaultConfig[name].constructor === Array) ? [] : {}; //我们让要复制的对象的name项=数组或者是json                   

                                self.extend('', config[name], defaultConfig[name]); //然后来无限调用函数自己 递归思想
                            } else {
                                config[name] = defaultConfig[name]; //如果不是对象，直接等于即可，不会发生引用。
                            }
                        }
                    }
                    for (var name in config) {
                        if (config.hasOwnProperty(name) && (!o.hasOwnProperty(name))) {
                            if (typeof config[name] === "object") {
                                o[name] = (config[name].constructor === Array) ? [] : {}; //我们让要复制的对象的name项=数组或者是json                   
                                self.extend(o[name], config[name], defaultConfig[name]); //然后来无限调用函数自己 递归思想
                            } else {
                                o[name] = config[name]; //如果不是对象，直接等于即可，不会发生引用。
                            }
                        }
                    }
                    return o; //然后在把复制好的对象给return出去
                }
            }
        }
    }

    win.Lottery = function(obj) {
        return new lottery(obj);
    }
})(window);





var draw = new Lottery({
    id: '#lottery', //整个活动选择器控件
    awardsSelector: '.lottery-unit', //奖项选择器
    drawButton: '#logft', //点击抽奖按钮的选择器
    nanNum: function() { //当抽奖次数为0的时候执行
        $('.modal3').show();
    },
    okNum: function(that) { //当还有抽奖次数的时候执行
        $.get("/json/currentPrize.json?v=" + new Date().getTime(), null,
            function(data) { //获取奖品
                $("#prize").html(data.MiaoShu);
                that.extendConfig.setmyjiangpin.call(null);
                that.prize = data.prize;
                that.roll();
            }, "json");
        that.playnum = that.playnum - 1; //执行转盘了则次数减1
        if (that.playnum <= 0) {
            that.playnum = 0;
        }
        $('.playnum').html(that.playnum);
    },
    winElart: function(that) { //显示弹窗
        if (that.prize == that.notWin) {
            setTimeout("$('.modal2').show();", 2600);
        } else {
            setTimeout("$('.modal1').show();", 2600);
        }
    },
    isLogin: function() { //检测是否登陆function
        var islogin = false;
        $.ajaxSetup({ //设置get同步请求
            async: false
        });
        $.get("/json/login.json?v=" + new Date().getTime(), null,
            function(data) {
                if (data.result == 'ok') {
                    islogin = true;
                }
            }, "json");
        return islogin;
    },
    loadingGet: function(e) { //初始化加载ing...
        //弹窗关闭
        $('.modal_close').on('click', function() {
            $('.modal').hide();
        });
        $.get("/json/login.json?v=" + new Date().getTime(), null,
            function(data) {
                if (data !== null && data.result == "ok") {
                    e.playnum = data.shengyu; //初始次数，由后台传入
                    $('.playnum').html(e.playnum);
                }
                return false;
            }, "json");
    },
    setmyjiangpin: function() { //显示我获得的奖品
        $.get("/json/myPrize.json?v=" + new Date().getTime(), null,
            function(data) {
                if (data !== null) {
                    var lis = "";
                    if (data.JiangXiangMingCheng1 && data.JiangXiangMingCheng1 != "谢谢参与") {
                        lis += '<li><div class="list1">' + data.MM1 + '月' + data.Day1 + '日</div><div class="list2">' + data.JiangXiangMingCheng1 + '</div><div class="list3">' + data.MiaoShu1 + '</div></li>';
                    }
                    if (data.JiangXiangMingCheng2 && data.JiangXiangMingCheng2 != "谢谢参与") {
                        lis += '<li><div class="list1">' + data.MM2 + '月' + data.Day2 + '日</div><div class="list2">' + data.JiangXiangMingCheng2 + '</div><div class="list3">' + data.MiaoShu2 + '</div></li>';
                    }
                    if (data.JiangXiangMingCheng3 && data.JiangXiangMingCheng3 != "谢谢参与") {
                        lis += '<li><div class="list1">' + data.MM3 + '月' + data.Day3 + '日</div><div class="list2">' + data.JiangXiangMingCheng3 + '</div><div class="list3">' + data.MiaoShu3 + '</div></li>';
                    }
                    if (data.JiangXiangMingCheng4 && data.JiangXiangMingCheng4 != "谢谢参与") {
                        lis += '<li><div class="list1">' + data.MM4 + '月' + data.Day4 + '日</div><div class="list2">' + data.JiangXiangMingCheng4 + '</div><div class="list3">' + data.MiaoShu4 + '</div></li>';
                    }
                    if (data.JiangXiangMingCheng5 && data.JiangXiangMingCheng5 != "谢谢参与") {
                        lis += '<li><div class="list1">' + data.MM5 + '月' + data.Day5 + '日</div><div class="list2">' + data.JiangXiangMingCheng5 + '</div><div class="list3">' + data.MiaoShu5 + '</div></li>';
                    }
                    if (data.JiangXiangMingCheng6 && data.JiangXiangMingCheng6 != "谢谢参与") {
                        lis += '<li><div class="list1">' + data.MM6 + '月' + data.Day6 + '日</div><div class="list2">' + data.JiangXiangMingCheng6 + '</div><div class="list3">' + data.MiaoShu6 + '</div></li>';
                    }
                    $("#myjiangpin").html(lis);
                }
                return false;
            }, "json");
    }
});