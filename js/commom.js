/**
 * Created by jojopoper on 2016/12/18.
 */

var BackgroundServerAddress = 'http://wechat.ebitgo.com/v';
var BackgroundTestServerAddress = 'http://192.168.1.130:18999';
var CurrentServer = BackgroundServerAddress;
var BackgroundHongbaoTestServerAddress = 'http://192.168.1.130:12468';
var BackgroundHongbaoServerAddress = 'http://lucky.ebitgo.com';
var CurrentHongbaoServer = BackgroundHongbaoTestServerAddress;
var HongbaoRequest = '/request';
var TestFederationServer = 'http://localhost:1888/federation';
var ServiceFederationServer = 'http://ebitgo.com:1888/federation';
var CurrentFederationServer = ServiceFederationServer;
var StellarLiveNetworkUrl = 'https://horizon.stellar.org';
var StellarLiveNetworkUrlFly = 'https://api.chinastellar.com';
var StellarTestNetworkUrl = 'https://horizon-testnet.stellar.org';
var StellarCurrentNetworkUrl = StellarLiveNetworkUrlFly;
var StellarAccounts = '/accounts';
var StellarTransactions = '/transactions';
var StellarLedgers = '/ledgers';
var AnchorServerLocalUrl = 'http://localhost:8765';
var AnchorServerRemoteUrl = 'http://anchor.ledgercn.com:8765';
var AnchorServerUrl = AnchorServerRemoteUrl;

var ReturnCorrectlyFlag = 0;
var UserNotExistFlag = 5;

var mUserID = "";
var mUpdateTime = null;
var mTransKey = "";
var mLanguage = "";
var mUnique = "";
var mKey0 = "";
var mKey1 = "";
var mAddress = "";

function setStellarNetwork(nw) {
    if(nw == 'LIVE') {
        StellarSdk.Network.usePublicNetwork();
        //StellarCurrentNetworkUrl = StellarLiveNetworkUrl;
    } else {
        StellarSdk.Network.useTestNetwork();
        //StellarCurrentNetworkUrl = StellarTestNetworkUrl;
    }
}

function clearInput(inputid) {
    $("#"+inputid).val('');
}

function randomParam() {
    return "timer=" + Math.random().toString();
}

function CheckInputPositiveFloat(oInput) {
    if( ! /^\d+\.?\d{0,8}$/.test(oInput.value)) {
        var s = oInput.value;
        oInput.value = s.substring(0,s.length-1);
    }
}

function CheckInputPositiveInt(oInput) {
    if( ! /^\d+$/.test(oInput.value)) {
        var s = oInput.value;
        oInput.value = s.substring(0,s.length-1);
    }
}

function saveKeyDatas() {
    $.cookie('userid', mUserID, {path:'/', expires: 1});
    $.cookie('time', mUpdateTime, {path:'/', expires: 1});
    $.cookie('language', mLanguage, {path:'/', expires: 1}); // , domain:'ledgercn.com'
    $.cookie('unique',mUnique, {path:'/', expires: 1});
    $.cookie('key0',mKey0, {path:'/', expires: 1});
    $.cookie('key1',mKey1, {path:'/', expires: 1});
    $.cookie('address',mAddress, {path:'/', expires: 1});
    $.cookie('transkey',mTransKey, {path:'/', expires: 1});
}

function readKeyDatas() {
    mLanguage = $.cookie("language");
    mUserID = $.cookie('userid');
    mUpdateTime = $.cookie('time');
    mUnique = $.cookie("unique");
    mTransKey = $.cookie("transkey");
    mKey0 = $.cookie("key0");
    mKey1 = $.cookie("key1");
    mAddress = $.cookie("address");
}

function ShoworHideBody(iconid, bodyid) {
    bodyObj = $("#"+bodyid);
    iconObj = $("#"+iconid);
    if (bodyObj.css('display') == 'none') {
        iconObj.attr('class','fa fa-caret-down');
        bodyObj.css('display','inherit');
    } else {
        iconObj.attr('class','fa fa-caret-right');
        bodyObj.css('display','none');
    }
}

function setDetailVisible(id) {
    obj = $('#' + id);
    if(obj.css('display') == 'none') {
        obj.css('display','inherit');
    } else {
        obj.css('display','none');
    }
}

function SubString(src, headlen, taillen) {
    srcLen = src.length;
    if(srcLen <= (headlen + taillen)) {
        return src
    }
    return src.substr(0,headlen) + '...' + src.substr(srcLen-taillen-1);
}

function pad(num, n) {
    var len = num.toString().length;
    while(len < n) {
        num = "0" + num;
        len++;
    }
    return num;
}

// 格式为YYYY-MM-DD HH:mm:ss或者null，如果为null则返回当前日期
function getDate(datetimeStr){
    if(datetimeStr == null || datetimeStr == ""){
        dt = new Date();
        return new Date(dt.getFullYear(),dt.getMonth(),dt.getDate()).getTime();
    }
    dt = new Date(datetimeStr);
    return new Date(dt.getFullYear(),dt.getMonth(),dt.getDate()).getTime();
}

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
        + " " + date.getHours() + seperator2 + date.getMinutes()
        + seperator2 + date.getSeconds();
    return currentdate;
}

function getLocalDateTimeString(dt,forceLong,language){
    dtime = new Date(dt);
    dttime = getDate(dt);
    ntime = getDate();

    if(!forceLong && (ntime - dttime < 86400000)){ // 1天之内的只显示时间，不显示日期
        return pad(dtime.getHours(),2) + ":" + pad(dtime.getMinutes(),2) + ":" + pad(dtime.getSeconds(),2);
    }
    if (language == 'cn'){
        return dtime.getFullYear() + "-" + pad(dtime.getMonth()+1,2) + "-" + pad(dtime.getDate(),2) + " " +  pad(dtime.getHours(),2) + ":" + pad(dtime.getMinutes(),2) + ":" + pad(dtime.getSeconds(),2);
    }
    return pad(dtime.getMonth()+1,2) + "/" + pad(dtime.getDate(),2) + "/" + dtime.getFullYear() + " " +  pad(dtime.getHours(),2) + ":" + pad(dtime.getMinutes(),2) + ":" + pad(dtime.getSeconds(),2);
}

function randomWord(randomFlag, min, max){
    var str = "",
        range = min,
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    // 随机产生
    if(randomFlag){
        range = Math.round(Math.random() * (max-min)) + min;
    }
    for(var i=0; i<range; i++){
        pos = Math.round(Math.random() * (arr.length-1));
        str += arr[pos];
    }
    return str;
}

function changeServerClick(obj, title) {
    if(obj == null) {
        return;
    }
    obj.text(title);
    if(title == 'stellar.org') {
        StellarCurrentNetworkUrl = StellarLiveNetworkUrl;
        $.cookie('serv',0, {path:'/', expires: 10});
    } else if(title == 'chinastellar.com'){
        StellarCurrentNetworkUrl = StellarLiveNetworkUrlFly;
        $.cookie('serv',1, {path:'/', expires: 10});
    }
}

function getServerParam(obj) {
    serv = getUrlParam('serv');
    if(serv == null || serv == '' || serv == undefined) {
        serv = $.cookie("serv");
    }
    if(serv == null || serv == '' || serv == undefined) {
        serv = 1;
    } else {
        if(serv == 0) {
            StellarCurrentNetworkUrl = StellarLiveNetworkUrl;
            if(obj != null) {
                obj.text('stellar.org')
            }
        } else if(serv == 1) {
            StellarCurrentNetworkUrl = StellarLiveNetworkUrlFly;
            if(obj != null) {
                obj.text('chinastellar.org')
            }
        }
    }

    $.cookie('serv',serv, {path:'/', expires: 10});
}