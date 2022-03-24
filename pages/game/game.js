// pages/game/game.js
var data = require("../../utils/data.js")
const {getRpx} = require("../../utils/utils");

var map = []
var box = []
let boxWithdraw = []
let wIndex = -1
let width = 700
let height = 700
var w = 40
let withdrawMax = 20//最大倒退数
//人物的行与列
var row = 0
var col = 0
var row_len = 0
var col_len = 0
Page({

    initMap: function (level) {

        let mapData = data.maps[this.data.index][level].Map
        mapData = mapData.split("\n")

        row_len = mapData.length
        col_len = mapData[0].length
        w = width / col_len / getRpx()
        height = width / col_len * row_len
        this.setData({
            width: width,
            height: height,
        })
        console.log("row_len====", row_len)
        console.log("col_len", col_len)
        for (var i = 0; i < row_len; i++) {
            box[i] = new Array()
            map[i] = new Array()
            for (var j = 0; j < col_len; j++) {
                box[i][j] = 0
                map[i][j] = 2

                if (mapData[i][j] == "*") {//箱子叠球
                    box[i][j] = 7
                    map[i][j] = 3
                } else if (mapData[i][j] == "+") {//人叠球
                    box[i][j] = 5
                    map[i][j] = 3
                    row = i
                    col = j
                } else if (mapData[i][j] == "@") {//人
                    box[i][j] = 5
                    row = i
                    col = j
                } else if (mapData[i][j] == "$") {//箱子
                    box[i][j] = 4
                } else if (mapData[i][j] == ".") {//球
                    map[i][j] = 3
                } else if (mapData[i][j] == "-") {//空地
                    map[i][j] = 2
                } else if (mapData[i][j] == "#") {//墙
                    map[i][j] = 1
                }else if (mapData[i][j] == "_") {//墙
                    map[i][j] = 0
                }
            }
        }
        this.saveBox()
    },
    drawCanvas: function () {
        console.log("wIndex", wIndex)
        console.log("boxWithdraw", boxWithdraw)
        let ctx = this.ctx
        ctx.clearRect(0, 0, 200, 385)
        for (var i = 0; i < row_len; i++) {
            // let rev = map[i].reverse()
            // let b = false
            // let stop = rev.length - 1
            // for (let k = 0; k < rev.length; k++) {
            //     if (rev[k] == 1) {
            //         stop = rev.length-k
            //         break
            //     }
            // }
            // map[i].reverse()
            // console.log("stop",stop)
            for (var j = 0; j < col_len; j++) {
                let img = ""
                if (map[i][j] == 1) {
                    // b = true
                    img = "wall1.png"
                } else if (map[i][j] == 3) {
                    img = "ball2.png"
                } else if (map[i][j] == 0) {
                    img = ""
                }else {
                    img = "img.png"
                }
                if (img.length > 0) {
                    ctx.drawImage("/images/icons/" + img, j * w, i * w, w, w)
                }

                if (box[i][j] == 4) {
                    ctx.drawImage("/images/icons/box1.png", j * w, i * w, w, w)
                } else if (box[i][j] == 7) {
                    ctx.drawImage("/images/icons/box3.png", j * w, i * w, w, w)
                } else if (box[i][j] == 5) {
                    row = i
                    col = j
                    ctx.drawImage("/images/icons/me.gif", j * w, i * w, w, w)

                }
            }
        }
        ctx.draw()
    },
    up: function () {
        if (row > 0) {
            if (map[row - 1][col] != 1 && box[row - 1][col] != 4 && box[row - 1][col] != 7) {
                box[row][col] = 0
                row = row - 1
                box[row][col] = 5
                this.saveBox()
            } else if (box[row - 1][col] == 4 || box[row - 1][col] == 7) {
                if (row - 1 > 0) {
                    if (map[row - 2][col] != 1 && box[row - 2][col] != 4&& box[row - 2][col] != 7) {
                        if (map[row - 2][col] == 3) {
                            box[row - 2][col] = 7
                        } else {
                            box[row - 2][col] = 4
                        }

                        box[row - 1][col] = 0
                        box[row][col] = 0
                        row = row - 1
                        box[row][col] = 5
                        this.saveBox()
                    }
                }
            }
            this.drawCanvas()
            this.checkWin()
        }
    },
    down: function () {
        if (row < row_len - 1) {
            if (map[row + 1][col] != 1 && box[row + 1][col] != 4 && box[row + 1][col] != 7) {
                box[row][col] = 0
                row = row + 1
                box[row][col] = 5
                this.saveBox()
            } else if (box[row + 1][col] == 4 || box[row + 1][col] == 7) {
                if (row + 1 < row_len - 1) {
                    if (map[row + 2][col] != 1 && box[row + 2][col] != 4&& box[row + 2][col] != 7) {
                        if (map[row + 2][col] == 3) {
                            box[row + 2][col] = 7
                        } else {
                            box[row + 2][col] = 4
                        }
                        box[row + 1][col] = 0
                        box[row][col] = 0
                        row = row + 1
                        box[row][col] = 5
                        this.saveBox()
                    }
                }
            }
            this.drawCanvas()
            this.checkWin()
        }
    },
    left: function () {
        if (col > 0) {
            if (map[row][col - 1] != 1 && box[row][col - 1] != 4 && box[row][col - 1] != 7) {
                box[row][col] = 0
                col = col - 1
                box[row][col] = 5
                this.saveBox()
            } else if (box[row][col - 1] == 4 || box[row][col - 1] == 7) {
                if (col - 1 > 0) {
                    if (map[row][col - 2] != 1 && box[row][col - 2] != 4&& box[row][col - 2] != 7) {
                        if (map[row][col - 2] == 3) {
                            box[row][col - 2] = 7
                        } else {
                            box[row][col - 2] = 4
                        }

                        box[row][col - 1] = 0
                        box[row][col] = 0
                        col = col - 1
                        box[row][col] = 5
                        this.saveBox()
                    }
                }
            }
            this.drawCanvas()
            this.checkWin()
        }
    },
    right: function () {
        if (col < col_len - 1) {
            if (map[row][col + 1] != 1 && box[row][col + 1] != 4 && box[row][col + 1] != 7) {
                box[row][col] = 0
                col = col + 1
                box[row][col] = 5
                this.saveBox()
            } else if (box[row][col + 1] == 4 || box[row][col + 1] == 7) {
                if (col + 1 < col_len - 1) {
                    if (map[row][col + 2] != 1 && box[row][col + 2] != 4&& box[row][col + 2] != 7) {
                        if (map[row][col + 2] == 3) {
                            box[row][col + 2] = 7
                        } else {
                            box[row][col + 2] = 4
                        }

                        box[row][col + 1] = 0
                        box[row][col] = 0
                        col = col + 1
                        box[row][col] = 5
                        this.saveBox()
                    }
                }
            }
            this.drawCanvas()
            this.checkWin()
        }
    },

    saveBox() {
        let box2 = this.getBox(box)

        if (boxWithdraw.length > withdrawMax) {
            boxWithdraw.splice(0, 1)
            boxWithdraw.push(box2)
        } else {
            boxWithdraw.push(box2)
            wIndex++
        }
    },
    withdraw() {
        if (wIndex < 1) {
        } else if (wIndex > withdrawMax) {
        } else {
            boxWithdraw.splice(wIndex, 1)
            box = this.getBox(boxWithdraw[wIndex - 1])
            wIndex--
            this.drawCanvas()
            this.checkWin()
        }
    },
    getBox(e) {
        let box2 = new Array()
        for (var i = 0; i < row_len; i++) {
            box2[i] = new Array()
            for (var j = 0; j < col_len; j++) {
                box2[i][j] = e[i][j]
            }
        }
        return box2
    },

    isWin: function () {
        for (var i = 0; i < row_len; i++) {
            for (var j = 0; j < col_len; j++) {
                if (box[i][j] == 4 && map[i][j] != 3) {
                    return false
                }
            }
        }
        return true
    },
    checkWin: function () {
        if (this.isWin()) {
            wx.showModal({
                title: "恭喜",
                content: "游戏成功",
                confirmText:"下一关",
            success:(res)=> {
                if (res.confirm) {
                    wx.navigateBack()
                    wx.navigateTo({
                        url: '../game/game?level=' + this.data.level+"&index="+this.data.index,
                    })
                } else if (res.cancel) {

                }
            },
            })
            let levels = wx.getStorageSync("levels"+this.data.index)
            if (levels.length > (this.data.level - 1)) {
                levels[this.data.level].can = true
                wx.setStorageSync("levels"+this.data.index, levels)
            }
        }
    },
    restartGame: function () {
        this.initMap(this.data.level - 1)
        this.drawCanvas()
    },
    /**
     * 页面的初始数据
     */
    data: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let level = options.level
        let index = options.index
        this.setData({
            level: parseInt(level) + 1,
            index: index
        })
        wx.setNavigationBarTitle({
            title:"关卡："+data.maps[index][level].Title
        })
        this.ctx = wx.createCanvasContext('myCanvas')
        this.initMap(level)
        this.drawCanvas()
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