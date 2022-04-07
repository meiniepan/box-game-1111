// pages/game/game.js
var data = require("../../utils/data.js")
const {getRpx} = require("../../utils/utils");

var map = []
var box = []
let boxWithdraw = []
let answer = []
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
let timer = null
Page({

    initMap: function (level) {

        answer = []
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
                } else if (mapData[i][j] == "_") {//墙
                    map[i][j] = 0
                }
            }
        }
        this.saveBox("")
    },
    drawCanvas: function () {
        let ctx = this.ctx
        ctx.clearRect(0, 0, width, height)
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
                } else {
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
    up(){
        console.log("timer",timer)
        if (timer!=null){
            clearInterval(timer)
        }
      this.up0()
    },

    up0: function () {
        if (row > 0) {
            if (map[row - 1][col] != 1 && box[row - 1][col] != 4 && box[row - 1][col] != 7) {
                box[row][col] = 0
                row = row - 1
                box[row][col] = 5
                this.saveBox(1)
            } else if (box[row - 1][col] == 4 || box[row - 1][col] == 7) {
                if (row - 1 > 0) {
                    if (map[row - 2][col] != 1 && box[row - 2][col] != 4 && box[row - 2][col] != 7) {
                        if (map[row - 2][col] == 3) {
                            box[row - 2][col] = 7
                        } else {
                            box[row - 2][col] = 4
                        }

                        box[row - 1][col] = 0
                        box[row][col] = 0
                        row = row - 1
                        box[row][col] = 5
                        this.saveBox(1)
                    }
                }
            }
            this.drawCanvas()
            this.checkWin()
        }
    },

    down(){
        if (timer!=null){
            clearInterval(timer)
        }
        this.down0()
    },

    down0: function () {
        if (row < row_len - 1) {
            if (map[row + 1][col] != 1 && box[row + 1][col] != 4 && box[row + 1][col] != 7) {
                box[row][col] = 0
                row = row + 1
                box[row][col] = 5
                this.saveBox(2)
            } else if (box[row + 1][col] == 4 || box[row + 1][col] == 7) {
                if (row + 1 < row_len - 1) {
                    if (map[row + 2][col] != 1 && box[row + 2][col] != 4 && box[row + 2][col] != 7) {
                        if (map[row + 2][col] == 3) {
                            box[row + 2][col] = 7
                        } else {
                            box[row + 2][col] = 4
                        }
                        box[row + 1][col] = 0
                        box[row][col] = 0
                        row = row + 1
                        box[row][col] = 5
                        this.saveBox(2)
                    }
                }
            }
            this.drawCanvas()
            this.checkWin()
        }
    },

    left(){
        if (timer!=null){
            clearInterval(timer)
        }
        this.left0()
    },
    left0: function () {
        if (col > 0) {
            if (map[row][col - 1] != 1 && box[row][col - 1] != 4 && box[row][col - 1] != 7) {
                box[row][col] = 0
                col = col - 1
                box[row][col] = 5
                this.saveBox(3)
            } else if (box[row][col - 1] == 4 || box[row][col - 1] == 7) {
                if (col - 1 > 0) {
                    if (map[row][col - 2] != 1 && box[row][col - 2] != 4 && box[row][col - 2] != 7) {
                        if (map[row][col - 2] == 3) {
                            box[row][col - 2] = 7
                        } else {
                            box[row][col - 2] = 4
                        }

                        box[row][col - 1] = 0
                        box[row][col] = 0
                        col = col - 1
                        box[row][col] = 5
                        this.saveBox(3)
                    }
                }
            }
            this.drawCanvas()
            this.checkWin()
        }
    },

    right(){
        if (timer!=null){
            clearInterval(timer)
        }
        this.right0()
    },

    right0: function () {
        if (col < col_len - 1) {
            if (map[row][col + 1] != 1 && box[row][col + 1] != 4 && box[row][col + 1] != 7) {
                box[row][col] = 0
                col = col + 1
                box[row][col] = 5
                this.saveBox(4)
            } else if (box[row][col + 1] == 4 || box[row][col + 1] == 7) {
                if (col + 1 < col_len - 1) {
                    if (map[row][col + 2] != 1 && box[row][col + 2] != 4 && box[row][col + 2] != 7) {
                        if (map[row][col + 2] == 3) {
                            box[row][col + 2] = 7
                        } else {
                            box[row][col + 2] = 4
                        }

                        box[row][col + 1] = 0
                        box[row][col] = 0
                        col = col + 1
                        box[row][col] = 5
                        this.saveBox(4)
                    }
                }
            }
            this.drawCanvas()
            this.checkWin()
        }
    },

    saveBox(id) {
        if(id!=""){
            answer.push(id)
        }
        let box2 = this.getBox(box)

        if (boxWithdraw.length > withdrawMax) {
            boxWithdraw.splice(0, 1)
            boxWithdraw.push(box2)
        } else {
            boxWithdraw.push(box2)
            wIndex++
        }
    },
    withdraw(){
        if (timer!=null){
            clearInterval(timer)
        }
        this.withdraw0()
    },
    withdraw0() {
        answer.push(5)
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
        let _this = this
        if (this.isWin()) {
            let levels = wx.getStorageSync("levels" + this.data.index)
            let next = levels.length > (this.data.level)

            levels[this.data.level - 1].solved = true
            if (next) {
                levels[this.data.level].unlock = true
            }
            wx.setStorageSync("levels" + this.data.index, levels)
            wx.showActionSheet({
                alertText: "恭喜!  游戏成功",
                itemColor: "#81D8D0",
                itemList: ['下一关', '上传答案'],
                success:(res)=> {
                    console.log(res.tapIndex)
                    if (res.tapIndex == 0) {
                        if (next) {
                            let level = this.data.level
                            this.setData({
                                level: level + 1,
                            })
                            wx.setNavigationBarTitle({
                                title: "关卡：" + data.maps[this.data.index][level].Title
                            })
                            this.initMap(level)
                            this.drawCanvas()


                        } else if (res.cancel) {

                        }
                    } else if (res.tapIndex == 1) {
                        let nick = wx.getStorageSync("user_name")
                        if (nick.length==0){
                            nick = "你的昵称"
                        }
                        wx.showModal({
                            title: "上传答案",
                            content: nick,
                            editable: true,
                            confirmText: "上传",
                            success: (res) => {
                                if (res.content.length==0){
                                    wx.showToast({
                                        icon: 'none',
                                        title: '昵称不能为空'
                                    })
                                    return
                                }
                                console.log("res", res)
                                wx.setStorageSync("user_name", res.content)
                                _this.upload()
                            },
                        })
                    }
                },
                fail(res) {
                    console.log(res.errMsg)
                }
            })


        }
    },

    upload() {
        const db = wx.cloud.database()
        let data2= {
            userName: wx.getStorageSync("user_name", "你的昵称"),
            title:data.maps[this.data.index][this.data.level-1].Title,
            answer: answer,
            steps: answer.length,
        }
        wx.showLoading({
            title: '上传中',
        })
        db.collection("answer").add({
            data: data2,
            success: res => {
                // 在返回结果中会包含新创建的记录的 _id
                wx.hideLoading()
                wx.showToast({
                    title: '上传成功',
                })
            },
            fail: err => {
                wx.hideLoading()
                wx.showToast({
                    icon: 'none',
                    title: '上传失败'
                })
            }
        })
    },

    restartGame: function () {
        wIndex = -1
        boxWithdraw = []
        this.initMap(this.data.level - 1)
        this.drawCanvas()
    },
    /**
     * 页面的初始数据
     */
    data: {
        helpArray: ["云端求解"],
    },

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
            title: "关卡：" + data.maps[index][level].Title
        })
        this.ctx = wx.createCanvasContext('myCanvas')
        this.initMap(level)
        this.drawCanvas()
    },

    doHelp(e) {
        let arr = ["云端求解"]

        wx.showActionSheet({
            alertText: "",
            itemColor: "#81D8D0",
            itemList: arr,
            success:(res2)=> {
                console.log(res2.tapIndex)
                if (res2.tapIndex==0){
                    this.getAnswer()
                }
            },
            fail(res) {
                console.log(res.errMsg)
            }
        })


    },

    getAnswer(){
        const db = wx.cloud.database()
        // 查询当前用户所有的 counters
        wx.showLoading({
            title: '加载中...',
        })
        db.collection("answer")
            .where({
            title:data.maps[this.data.index][this.data.level-1].Title
        })
            .get({
                success: res => {
                    wx.hideLoading()
                    console.log("res", res)
                    if (res.data.length > 0) {
                        var compare = function (x, y) {//比较函数
                            if (x.answer.length < y.answer.length) {
                                return -1;
                            } else if (x.answer.length > y.answer.length) {
                                return 1;
                            } else {
                                return 0;
                            }
                        }
                        res.data.sort(compare)
                        let arr = []
                        for (let i = 0; i < res.data.length; i++) {
                            if (i > 5) {
                                break
                            }
                            arr.push(res.data[i].userName+" [步数："+res.data[i].answer.length+"]")
                        }
                        wx.showActionSheet({
                            alertText: "云端答案",
                            itemColor: "#81D8D0",
                            itemList: arr,
                            success:(res2)=> {
                                console.log(res2.tapIndex)
                                this.playAnswer(res.data[res2.tapIndex].answer)
                            },
                            fail(res) {
                                console.log(res.errMsg)
                            }
                        })

                    } else {
                        wx.showToast({
                            icon: 'none',
                            title: '还没有答案呢'
                        })
                    }
                },
                fail: err => {
                    wx.hideLoading()
                    wx.showToast({
                        icon: 'none',
                        title: '系统升级中~~'
                    })
                    console.error('[数据库] [查询记录] 失败：', err)
                }
            })
    },
    playAnswer(arr) {
        if (arr.length > 0) {
            this.restartGame()
            let index = 0
             timer = setInterval(() => {
                    if (index == arr.length) {
                        clearInterval(timer)
                    }
                    if (arr[index] == 1) {
                        this.up0()
                    } else if (arr[index] == 2) {
                        this.down0()
                    } else if (arr[index] == 3) {
                        this.left0()
                    } else if (arr[index] == 4) {
                        this.right0()
                    } else if (arr[index] == 5) {
                        this.withdraw0()
                    }
                    index++
                }
                , 500)
        }
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