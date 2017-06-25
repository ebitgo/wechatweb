/**
 * Created by jojopoper on 2017/06/21.
 */

var QIndex = {
    uiViews:{},
    serverIP: '',
    serverPort: '',
    updatedMemo: null,
    refreshBtnCap: null,
    refreshBtn: null,
    quoteTable: null,
    secondLeft: 0,

    initController : function() {
        mLanguage = getUrlParam('l');
        this.serverIP = getUrlParam('ser');
        this.serverPort = getUrlParam('port');
        this.secondLeft = -1;
        this.initStrings();
        this.initView();
        this.getQuoteInfo();
        setInterval(this.quoteThread,1000);
    },

    initStrings : function() {
        this.updatedMemo = $('#quote_updated_time');
        this.refreshBtnCap = $('#quote_refresh_btn_cap');
        this.refreshBtn = $('#quote_refresh_btn');
        this.quoteTable = $('#quote_id_table');

        if(mLanguage == 'cn') {
            this.uiViews.LostServerMemo = '请从正确途径进入本页面';

            this.uiViews.btc38_title_cap = 'Btc38 价格';
            this.uiViews.polon_title_cap = 'Poloniex 价格';
            this.uiViews.yuanb_title_cap = '元宝网 价格';
            this.uiViews.BuyCap = '买';
            this.uiViews.SellCap = '卖';
            this.uiViews.dealCap = '最新成交价 : ';
            this.uiViews.updated_cap = ' 更新';
        } else {
            this.uiViews.LostServerMemo = 'Please enter this page from the right path';

            this.uiViews.btc38_title_cap = 'Btc38 Price';
            this.uiViews.polon_title_cap = 'Poloniex Price';
            this.uiViews.yuanb_title_cap = 'Yuanbao Price';
            this.uiViews.BuyCap = 'Buy';
            this.uiViews.SellCap = 'Sell';
            this.uiViews.dealCap = 'Latest transaction price : ';
            this.uiViews.updated_cap = ' Updated';
        }
    },

    initView : function() {
        if(mLanguage == 'cn'){
            $(document).attr("title","交易所挂单 - eBitGo");
        } else {
            $(document).attr("title","Quote Info - eBitGo");
            mLanguage = 'en';
        }

        if(this.serverIP == '' || this.serverIP == null || this.serverIP == undefined) {
            this.setErrorMemo(this.uiViews.LostServerMemo)
        }
    },

    setErrorMemo : function(t) {
        this.updatedMemo[0].innerHTML = '<a style="color: red;">' + t + '</a>';
        this.refreshBtnCap[0].innerText = '';
        this.refreshBtn.attr('style','display:none');
        this.quoteTable.attr('style','display:none');
    },

    quoteThread : function() {
        QIndex.secondLeft--;
        if(QIndex.secondLeft < 0) {
            return;
        }
        if(QIndex.secondLeft > 0) {
            if (mLanguage == 'cn') {
                QIndex.refreshBtnCap[0].innerText = QIndex.secondLeft + ' 秒';
            } else {
                QIndex.refreshBtnCap[0].innerText = QIndex.secondLeft + ' s';
            }
        } else {
            if(mLanguage == 'cn') {
                QIndex.refreshBtnCap[0].innerText = '正在读取...';
            } else {
                QIndex.refreshBtnCap[0].innerText = 'Reading...';
            }
            QIndex.getQuoteInfo();
        }
    },

    refreshBtnClick : function() {
        this.secondLeft = 1;
        this.getQuoteInfo();
    },

    getQuoteInfo : function() {
        if(QIndex.refreshBtn.attr('class') == 'fa fa-refresh fa-spin fa-2x') {
            return
        }
        QIndex.refreshBtn.attr('class','fa fa-refresh fa-spin fa-2x');
        $.ajax({
            url: 'http://' + QIndex.serverIP + ':' + QIndex.serverPort + '/getprice?t=all',
            dataType: 'json',
            cache :false,
            success: function(data, status, xhr) {
                //console.log('success============');
                //console.log(data);
                //console.log(status);
                //console.log(xhr);
                jsonobj=eval("("+data+")");
                if (jsonobj.codeid == 0) {
                    QIndex.quoteTable[0].innerHTML = '';
                    QIndex.setQuoteData(QIndex.uiViews.btc38_title_cap, 'CNY', jsonobj.data.btc38_data);
                    QIndex.setQuoteData(QIndex.uiViews.polon_title_cap, 'BTC', jsonobj.data.polon_data);
                    QIndex.setQuoteData(QIndex.uiViews.yuanb_title_cap, 'CNY', jsonobj.data.yuanbao_data);
                    QIndex.updatedMemo[0].innerText = getNowFormatDate() + QIndex.uiViews.updated_cap;
                }
            },
            error: function(xhr, status, e) {
                console.log('error ============');
                console.log(xhr);
                console.log(status);
                console.log(e);

            },
            complete : function() {
                QIndex.refreshBtn.attr('class','fa fa-refresh fa-2x');
                QIndex.secondLeft = 30;
            }
        })
    },

    setQuoteData : function(name,u, obj) {
        buylist = [];
        if(obj.buy != null && obj.buy.length > 0) {
            buylist[0] = obj.buy[0].price;
            buylist[1] = obj.buy[1].price;
            buylist[2] = obj.buy[2].price;
        }
        selllist = [];
        if(obj.sell != null && obj.sell.length > 0) {
            selllist[0] = obj.sell[0].price;
            selllist[1] = obj.sell[1].price;
            selllist[2] = obj.sell[2].price;
        }
        tradelist = [];
        if(obj.trade != null && obj.trade.length > 0) {
            tradelist[0] = obj.trade[0].price;
        }
        QIndex.addQuoteTable(name, u, buylist, selllist, tradelist);
    },

    addQuoteTable : function(title, untStr, blist, slist, dlist) {
        var tmp = '<tbody>';
        tmp += '<tr><td class="text-center" colspan="2" style="background-color: #28a4c9"><h4>' + title + '</h4></td></tr>';
        tmp += '<tr style="background-color: #9acfea">';
        tmp += '<td class="text-center"><label>' + QIndex.uiViews.BuyCap + ' (' + untStr + ')</label></td>';
        tmp += '<td class="text-center"><label>' + QIndex.uiViews.SellCap + '(' + untStr + ')</label></td>';
        tmp += '</tr>';
        if(blist.length > 0) {
            for(var idx = 0 ; idx < blist.length ; idx++) {
                tmp += '<tr>';
                tmp += '<td class="text-center"><label>' + blist[idx] + '</label></td>';
                tmp += '<td class="text-center"><label>' + slist[idx] + '</label></td>';
                tmp += '</tr>';
            }
        } else {
            tmp += '<tr>';
            tmp += '<td class="text-center"><label> - </label></td>';
            tmp += '<td class="text-center"><label> - </label></td>';
            tmp += '</tr>';
        }
        tmp += '<tr><td class="text-center" colspan="2">' + QIndex.uiViews.dealCap;
        if(dlist != null && dlist.length > 0) {
            tmp += dlist[0];
        } else {
            tmp += '-';
        }
        tmp += '</td></tr></tbody>';

        QIndex.quoteTable[0].innerHTML += tmp;
    }
};