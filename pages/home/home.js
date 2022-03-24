Page({

  chooseLevel: function (e) {
    let level = e.currentTarget.dataset.level
    wx.navigateTo({
      url: '../game/game?level=' + level,
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    levels: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    let levels = wx.getStorageSync("levels")
    if (levels instanceof Array) {
      console.log("array", "true")
    } else {
      console.log("array", "false")
      levels = []
      for (let i = 0; i < 696; i++) {
        if (i == 0) {
          levels.push({index: i, can: true})
        } else {
          levels.push({index: i, can: false})
        }
      }
      wx.setStorageSync("levels", levels)
    }

    this.setData({
      levels: levels,
    })
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