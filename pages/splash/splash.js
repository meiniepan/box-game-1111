// pages/splash/splash.js
Page({

    /**
     * 页面的初始数据
     */
    data: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        setTimeout(() => {
                this.checkOnline()
            }
            , 0)

    },
    checkOnline() {
        let time = new Date().getTime()/1000
        console.log("time",time)
        let time2 = 1650021110
        // let time2 = 0
        if (time>time2){

            wx.redirectTo({
                url: '/pages/home/home',
            })
        }else {
            wx.redirectTo({
                url: '/pages/wan/wan',
            })
        }

    },

    checkOnline2() {
        const db = wx.cloud.database()
        // 查询当前用户所有的 counters

        db.collection("db_set")
            .get({
                success: res => {
                    console.log("res", res)
                    if (res.data.length > 0) {
                        let online = res.data[0].online
                        let open_vip = res.data[0].open_vip
                        wx.setStorageSync("online", online)
                        wx.setStorageSync("open_vip", open_vip)
                        if (online) {
                            this.login()
                        } else {
                            wx.setStorageSync("user_type", "")
                            wx.switchTab({
                                url: '/pages/index/index',
                            })
                        }

                    } else {

                    }
                },
                fail: err => {
                    wx.showToast({
                        icon: 'none',
                        title: '系统升级中~~'
                    })
                    console.error('[数据库] [查询记录] 失败：', err)
                }
            })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})