var objGift = {
    playnum: 0,
    clickTag: false
};

//抽奖转盘
var lottery = {
    index: -1, //当前转动到哪个位置，起点位置
    count: 0, //总共有多少个位置
    timer: 0, //setTimeout的ID，用clearTimeout清除
    speed: 20, //初始转动速度
    times: 0, //转动次数
    cycle: 50, //转动基本次数：即至少需要转动多少次再进入抽奖环节
    prize: -1, //中奖位置
    init: function(id) {
        if ($("#" + id).find(".lottery-unit").length > 0) {

            $lottery = $("#" + id);
            console.log($lottery);
            $units = $lottery.find(".lottery-unit");
            this.obj = $lottery;
            this.count = $units.length;
            $lottery.find(".lottery-unit-" + this.index).addClass("active");
        };
    },
    roll: function() {
        var index = this.index;
        var count = this.count;
        var lottery = this.obj;
        $(lottery).find(".lottery-unit-" + index).removeClass("active");
        index += 1;
        if (index > count - 1) {
            index = 0;
        }
        $(lottery).find(".lottery-unit-" + index).addClass("active");
        this.index = index;
        return false;
    },
    stop: function(index) {
        this.prize = index;
        return false;
    }
};




function roll() {
    lottery.times += 1;
    lottery.roll(); //转动过程调用的是lottery的roll方法，这里是第一次调用初始化
    if (lottery.times > lottery.cycle + 10 && lottery.prize == lottery.index) {
        clearTimeout(lottery.timer);
        lottery.prize = -1;
        lottery.times = 0;
        objGift.clickTag = false;
    } else {
        if (lottery.times < lottery.cycle) {
            lottery.speed -= 10;
        } else if (lottery.times == lottery.cycle) {
            if (lottery.prize == 5) {
                setTimeout("$('.modal2').show();", 3000);
            } else {
                setTimeout("$('.modal1').show();", 3000);
            }
        } else {
            if (lottery.times > lottery.cycle + 10 && ((lottery.prize == 0 && lottery.index == 7) || lottery.prize == lottery.index + 1)) {
                lottery.speed += 110;
            } else {
                lottery.speed += 20;
            }
        }
        if (lottery.speed < 40) {
            lottery.speed = 40;
        };
        lottery.timer = setTimeout(roll, lottery.speed); //循环调用
    }
    return false;
}

//目前获取的奖品
function setmyjiangpin() {
    $.get("/json/myPrize.json?v=201801301655", null,
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

//检测是否登陆
function isLogin() {
    var islogin = false;
    $.ajaxSetup({ //设置get同步请求
        async: false
    });
    $.get("/json/login.json?v=201801301712", null,
        function(data) {
            if (data.result == 'ok') {
                islogin = true;
            }
        }, "json");
    return islogin;
}

$(function() {
    // 弹窗关闭
    $('.modal_close').on('click', function() {
        $('.modal').hide();
    });
    setmyjiangpin(); //目前获取的奖品

    $.get("/json/login.json?v=201801301701", null,
        function(data) {
            if (data !== null && data.result == "ok") {
                lottery.init('lottery');
                objGift.playnum = data.shengyu; //初始次数，由后台传入
                $('.playnum').html(objGift.playnum);
            }
            return false;
        }, "json");


    $("#lottery a").on('click', function() {
        if (isLogin()) { //已登录
            if (objGift.clickTag) { //click控制一次抽奖过程中不能重复点击抽奖按钮，后面的点击不响应
                return false;
            } else {

                lottery.speed = 100;
                //过程不响应click事件，会将objGift.clickTag置为false
                objGift.clickTag = true; //一次抽奖完成后，设置objGift.clickTag为true，可继续抽奖
                if (objGift.playnum <= 0) { //当抽奖次数为0的时候执行
                    $('.modal3').show();
                } else { //还有次数就执行

                    $.get("/json/currentPrize.json?v=201801301759", null,
                        function(data) { //获取奖品，也可以在这里判断是否登陆状态 
                            $("#prize").html(data.MiaoShu);
                            setmyjiangpin();
                            lottery.prize = data.prize;
                            roll();
                            objGift.clickTag = true;
                        }, "json");

                    objGift.playnum = objGift.playnum - 1; //执行转盘了则次数减1
                    if (objGift.playnum <= 0) {
                        objGift.playnum = 0;
                    }
                    $('.playnum').html(objGift.playnum);

                }
            }
        } else { //未登录
            alert('未登录，这里编写弹出注册框代码!');
        }
    });

});