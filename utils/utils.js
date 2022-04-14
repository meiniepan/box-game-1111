//获取px与rpx之间的比列
function getRpx(){
    var winWidth = wx.getSystemInfoSync().windowWidth;
    return 750/winWidth;
}

module.exports = {
    getRpx: getRpx,
}