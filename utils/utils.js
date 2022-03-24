//获取px与rpx之间的比列
function getRpx(){
    var winWidth = wx.getSystemInfoSync().windowWidth;
    console.log("winWidth",winWidth)
    return 750/winWidth;
}

module.exports = {
    getRpx: getRpx,
}