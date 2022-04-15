// pages/game/game.js
var data = require("../../utils/data.js")
const {getRpx} = require("../../utils/utils");


var map = []
var box = []
let boxWithdraw = []
let playAnswer = []
let playIndex = 0
let isVideo = false
let wIndex = -1
let width = 700
let height = 700
var w = 40
let withdrawMax = 100//最大倒退数
//人物的行与列
var row = 0
var col = 0
var row_len = 0
var col_len = 0
let timer = null
let canPlay = false;

var minOffset = 30;//最小偏移量，低于这个值不响应滑动处理
var minTime = 60;// 最小时间，单位：毫秒，低于这个值不响应滑动处理
var startX = 0;//开始时的X坐标
var startY = 0;//开始时的Y坐标
var startTime = 0;//开始时的毫秒数
Page({

    /**
     * 页面的初始数据
     */
    data: {
        helpArray: ["云端求解"],
        answer: [],
        boxSteps: 0,
        isPlay: false
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
    initMap: function (level) {
        isVideo = false
        wIndex = -1
        boxWithdraw = []
        this.setData({
            answer: [],
            boxSteps: 0,
        })
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
                } else if (mapData[i][j] == "_") {//无
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
                    img = "ball.png"
                } else if (map[i][j] == 0) {
                    img = ""
                } else {
                    img = "fill.png"
                }
                if (img.length > 0) {
                    ctx.drawImage("/images/icons/" + img, j * w, i * w, w, w)
                }

                if (box[i][j] == 4) {
                    ctx.drawImage("/images/icons/box1.png", j * w, i * w, w, w)
                } else if (box[i][j] == 7) {
                    ctx.drawImage("/images/icons/box2.png", j * w, i * w, w, w)
                } else if (box[i][j] == 5) {
                    row = i
                    col = j
                    let image = "/images/icons/me1.png"
                    if (map[i][j] == 3) {
                        image = "/images/icons/me2.png"
                    }else if (i%2 + j%2==1) {
                        image = "/images/icons/me3.png"
                    }
                    ctx.drawImage(image, j * w, i * w, w, w)
                }
            }
        }
        ctx.draw()
    },

    /**
     * 触摸开始事件，初始化startX、startY和startTime
     */
    touchStart: function (e) {
        console.log('touchStart', e)
        startX = e.touches[0].pageX; // 获取触摸时的x坐标
        startY = e.touches[0].pageY; // 获取触摸时的x坐标
        startTime = new Date().getTime();//获取毫秒数
    },

    /**
     * 触摸取消事件 （手指触摸动作被打断，如来电提醒，弹窗），要将startX、startY和startTime重置
     */
    touchCancel: function (e) {
        startX = 0;//开始时的X坐标
        startY = 0;//开始时的Y坐标
        startTime = 0;//开始时的毫秒数
    },

    /**
     * 触摸结束事件，主要的判断在这里
     */
    touchEnd: function (e) {
        console.log('touchEnd', e)
        var endX = e.changedTouches[0].pageX;
        var endY = e.changedTouches[0].pageY;
        var touchTime = new Date().getTime() - startTime;//计算滑动时间
        //开始判断
        //1.判断时间是否符合
        if (touchTime >= minTime) {
            //2.判断偏移量：分X、Y
            var xOffset = endX - startX;
            var yOffset = endY - startY;
            console.log('xOffset', xOffset)
            console.log('yOffset', yOffset)
            //①条件1（偏移量x或者y要大于最小偏移量）
            //②条件2（可以判断出是左右滑动还是上下滑动）
            if (Math.abs(xOffset) >= Math.abs(yOffset) && Math.abs(xOffset) >= minOffset) {
                //左右滑动
                //③条件3（判断偏移量的正负）
                if (xOffset < 0) {
                    console.log('向左滑动')
                    this.left()
                } else {
                    console.log('向右滑动')
                    this.right()
                }
            } else if (Math.abs(xOffset) < Math.abs(yOffset) && Math.abs(yOffset) >= minOffset) {
                //上下滑动
                //③条件3（判断偏移量的正负）
                if (yOffset < 0) {
                    console.log('向上滑动')
                    this.up()
                } else {
                    console.log('向下滑动')
                    this.down()
                }
            }
        } else {
            console.log('滑动时间过短', touchTime)
        }
    },

    up() {
        this.cancelPlay()
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
                        this.saveBox(1, true)
                    }
                }
            }
            this.drawCanvas()
            this.checkWin()
        }
    },

    down() {
        this.cancelPlay()
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
                        this.saveBox(2, true)
                    }
                }
            }
            this.drawCanvas()
            this.checkWin()
        }
    },

    left() {
        this.cancelPlay()
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
                        this.saveBox(3, true)
                    }
                }
            }
            this.drawCanvas()
            this.checkWin()
        }
    },

    right() {
        this.cancelPlay()
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
                        this.saveBox(4, true)
                    }
                }
            }
            this.drawCanvas()
            this.checkWin()
        }
    },
    cancelPlay() {
        canPlay = false
        this.setData({
            isPlay: false,
            sPlay: false,
        })
    },
    saveBox(id, boxed = false) {
        if (id != "") {
            this.data.answer.push(id)
            if (boxed) {
                this.data.boxSteps++
            }
            this.setData({
                answer: this.data.answer,
                boxSteps: this.data.boxSteps
            })
        }
        let box2 = this.getBox(box)

        if (boxWithdraw.length > withdrawMax) {
            boxWithdraw.splice(0, 1)
            boxWithdraw.push({boxed: boxed, map: box2})
        } else {
            boxWithdraw.push({boxed: boxed, map: box2})
            wIndex++
        }
    },
    withdraw() {
        this.cancelPlay()
        this.withdraw0()
    },

    withdraw0(play) {
        if (this.data.answer.length > 0) {
            this.data.answer.pop()
            this.setData({
                answer: this.data.answer,
            })
        }
        if (wIndex < 1) {
        } else if (wIndex > withdrawMax) {
        } else {
            let boxed0 = boxWithdraw[wIndex].boxed
            if (boxed0) {
                this.setData({
                    boxSteps: --this.data.boxSteps
                })
            }

            boxWithdraw.splice(wIndex, 1)
            box = this.getBox(boxWithdraw[wIndex - 1].map)
            wIndex--
            if (play) {
                playIndex--
            }
            this.drawCanvas()
            this.checkWin()
            // if (!boxed && !boxed0) {
            //     setTimeout(() => {
            //         this.withdraw0(boxWithdraw[wIndex].boxed)
            //     }, 300)
            // }

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
        if (this.isWin() && !isVideo) {
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
                success: (res) => {
                    if (res.tapIndex == 0) {
                        if (next) {
                            let level = this.data.level
                            this.setData({
                                level: level + 1,
                            }, () => {
                                wx.setNavigationBarTitle({
                                    title: "关卡：" + data.maps[this.data.index][level].Title
                                })
                                _this.restartGame()
                            })


                        } else if (res.cancel) {

                        }
                    } else if (res.tapIndex == 1) {
                        let nick = wx.getStorageSync("user_name")
                        if (nick.length == 0) {
                            nick = "你的昵称"
                        }
                        wx.showModal({
                            title: "上传答案",
                            content: nick,
                            editable: true,
                            confirmText: "上传",
                            success: (res) => {
                                if (res.content.length == 0) {
                                    wx.showToast({
                                        icon: 'none',
                                        title: '昵称不能为空'
                                    })
                                    return
                                }
                                _this.securityText(res.content, () => {
                                    wx.setStorageSync("user_name", res.content)
                                    _this.upload()
                                })
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
    async securityText(content, func) {
        wx.cloud.callFunction({
            name: 'msgSecCheck',
            data: {text: content},
            complete: res => {
                var result = res.result.result.suggest
                console.log("security", res.result.result.suggest)
                if (result === "risky") {
                    wx.showToast({
                        icon: 'none',
                        title: '注意敏感词汇'
                    })
                } else {
                    func()
                }
            }
        })
    },
    upload() {
        const db = wx.cloud.database()
        let data2 = {
            userName: wx.getStorageSync("user_name", "你的昵称"),
            title: data.maps[this.data.index][this.data.level - 1].Title,
            answer: this.data.answer,
            steps: this.data.answer.length,
            boxSteps: this.data.boxSteps,
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
        this.cancelPlay()
        this.restartGame0()
    },
    restartGame0: function () {

        this.initMap(this.data.level - 1)
        this.drawCanvas()
    },


    doHelp(e) {
        let arr = ["云端求解"]

        wx.showActionSheet({
            alertText: "",
            itemColor: "#81D8D0",
            itemList: arr,
            success: (res2) => {
                if (res2.tapIndex == 0) {
                    this.getAnswer()
                }
            },
            fail(res) {
                console.log(res.errMsg)
            }
        })


    },

    getAnswer() {
        const db = wx.cloud.database()
        // 查询当前用户所有的 counters
        wx.showLoading({
            title: '加载中...',
        })
        db.collection("answer")
            .where({
                title: data.maps[this.data.index][this.data.level - 1].Title
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
                            let boxSteps = "未知"
                            if (res.data[i].boxSteps != null) {
                                boxSteps = res.data[i].boxSteps
                            }
                            arr.push(res.data[i].userName
                                + " [移步:" + res.data[i].answer.length + "]"
                                + " [移箱:" + boxSteps + "]")
                        }
                        wx.showActionSheet({
                            alertText: "云端答案",
                            itemColor: "#81D8D0",
                            itemList: arr,
                            success: (res2) => {
                                this.initPlayAnswer(res.data[res2.tapIndex].answer)
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

    initPlayAnswer(arr) {
        this.restartGame0()

        playAnswer = arr
        playIndex = 0
        isVideo = true
        this.setData({
            isPlay: true,
            sPlay: true,
        })
        canPlay = true;
        this.playAnswer()
    },

    playBack(e) {
        if (this.data.sPlay) {
            this.setData({
                sPlay: false,
            })
            return
        }
        canPlay = true;
        this.withdraw0(true)
    },
    doPlay() {
        canPlay = !this.data.sPlay;
        this.setData({
            sPlay: !this.data.sPlay,
        })
        this.playAnswer()
    },
    playNext(e) {
        if (this.data.sPlay) {
            this.setData({
                sPlay: false,
            })
            return
        }
        canPlay = true;
        this.playAnswer()
    },

    playAnswer(loop) {
        if (!canPlay) {
            return
        }
        if (playIndex < playAnswer.length) {
            switch (playAnswer[playIndex]) {
                case 1:
                    this.up0()
                    break
                case 2:
                    this.down0()
                    break
                case 3:
                    this.left0()
                    break
                case 4:
                    this.right0()
                    break
                case 5:
                    this.withdraw0()
                    break
                default:
                    break
            }

            playIndex++
            if (this.data.sPlay) {
                setTimeout(() => {
                    this.playAnswer(true)
                }, 100)
            }

        } else {
            this.cancelPlay()
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