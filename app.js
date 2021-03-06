//app.js
App({
  onLaunch: function () {

    //隐藏系统tabbar
    //wx.hideTabBar();
    //获取设备信息
    this.getSystemInfo();
    this.getSystemInfoBotom();

    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  onShow: function() {
    //隐藏系统tabbar
    //wx.hideTabBar();
  },
  getOpenid() {
    let openid = wx.getStorageSync("openid")
    if (!isEmpty(openid)) {
      return openid
    }
    return new Promise(resolve => {
      wx.cloud.callFunction({
        name: 'get',
        complete: res => {
          var openid = res.result.openid
          resolve(openid)
          console.log("openid", openid)
          wx.setStorageSync("openid", openid)
        }
      })
    });
  },
  httpGet0: function (url, data, loading, loadingMsg) {
    return this.httpBase0('GET', url, data, loading, loadingMsg);
  },
  httpPost0: function (url, data, loading = true, loadingMsg, contentType) {
    return this.httpBase0('POST', url, data, loading, loadingMsg, contentType);
  },
  httpBase0: function (method, url, data, loading = false, loadingMsg, contentType = 'application/x-www-form-urlencoded') {
    let requestUrl = url;
    console.log("url", requestUrl)
    if (loading) {
      wx.showLoading({
        title: loadingMsg || '加载中...',
        mask: true
      });
    } else {
      wx.showNavigationBarLoading();
    }

    function request(resolve, reject) {
      wx.request({
        header: {
          'Content-Type': contentType,
        },
        method: method,
        url: requestUrl,
        data: data,
        success: function (result) {
          if (loading) {
            wx.hideLoading({
              complete: (res) => {
              },
            });
          } else {
            wx.hideNavigationBarLoading({
              complete: (res) => {
              },
            });
          }

          let res = result.data || {};
          let code = res.respCode;
          let errMsg = res.respMsg;


          resolve(res);
        },
        fail: res => {
          reject(res);

          if (loading) {
            wx.hideLoading({
              complete: (res) => {
              },
            });
          } else {
            wx.hideNavigationBarLoading({
              complete: (res) => {
              },
            });
          }

          wx.showToast({
            title: '网络异常，请稍后重试',
            icon: 'none'
          });
        }
      });
    }

    return new Promise(request);
  },

  getSystemInfoBotom: function () {
    let t = this;
    wx.getSystemInfo({
      success: function (res) {
        t.globalData.systemInfoBottom = res;
      },
    })
  },
  getSystemInfo() {
    let t = this;
    if (t.globalData.systemInfo && !t.globalData.systemInfo.ios) {
      return t.globalData.systemInfo;
    } else {
      let systemInfo = wx.getSystemInfoSync();
      //操作系统及版本
      let ios = !!(systemInfo.system.toLowerCase().search('ios') + 1);
      let rect;
      try {
        //获取菜单按钮（右上角胶囊按钮）的布局位置信息。坐标信息以屏幕左上角为原点。
        rect = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
        if (rect === null) {
          throw 'getMenuButtonBoundingClientRect error';
        }
        //取值为0的情况  有可能width不为0 top为0的情况
        if (!rect.width || !rect.top || !rect.left || !rect.height) {
          throw 'getMenuButtonBoundingClientRect error';
        }
      } catch (error) {
        let gap = ''; //胶囊按钮上下间距 使导航内容居中
        let width = 96; //胶囊的宽度
        if (systemInfo.platform === 'android') {
          gap = 8;
          width = 96;
        } else if (systemInfo.platform === 'devtools') {
          if (ios) {
            gap = 5.5; //开发工具中ios手机
          } else {
            gap = 7.5; //开发工具中android和其他手机
          }
        } else {
          gap = 4;
          width = 88;
        }
        //状态栏的高度，单位px
        if (!systemInfo.statusBarHeight) {
          //开启wifi的情况下修复statusBarHeight值获取不到= 屏幕宽度，单位px - screenHeight - 20
          systemInfo.statusBarHeight = systemInfo.screenHeight - systemInfo.windowHeight - 20;
        }
        rect = {
          //获取不到胶囊信息就自定义重置一个
          bottom: systemInfo.statusBarHeight + gap + 32,
          height: 32,
          left: systemInfo.windowWidth - width - 10,
          right: systemInfo.windowWidth - 10,
          top: systemInfo.statusBarHeight + gap,
          width: width
        };
      }
      let navBarHeight = '';
      if (!systemInfo.statusBarHeight) {
        systemInfo.statusBarHeight = systemInfo.screenHeight - systemInfo.windowHeight - 20;
        navBarHeight = (function () {
          let gap = rect.top - systemInfo.statusBarHeight;
          return 2 * gap + rect.height;
        })();

        systemInfo.statusBarHeight = 0;
        systemInfo.navBarExtendHeight = 4; //下方扩展4像素高度 防止下方边距太小
      } else {
        navBarHeight = (function () {
          let gap = rect.top - systemInfo.statusBarHeight;
          return systemInfo.statusBarHeight + 2 * gap + rect.height;
        })();
        if (ios) {
          systemInfo.navBarExtendHeight = 4; //下方扩展4像素高度 防止下方边距太小
        } else {
          systemInfo.navBarExtendHeight = 0;
        }
      }
      systemInfo.navBarHeight = navBarHeight;
      systemInfo.capsulePosition = rect; //右上角胶囊按钮信息bottom: 58 height: 32 left: 317 right: 404 top: 26 width: 87 目前发现在大多机型都是固定值 为防止不一样所以会使用动态值来计算nav元素大小
      systemInfo.ios = ios; //是否ios
      //将信息保存到全局变量中,后边再用就不用重新异步获取了
      t.globalData.systemInfo = systemInfo;
    }
  },

  globalData: {
    projectItemData: null,
    systemItemData: null,
    systemInfo: null,//客户端设备信息
    userInfo: null,
    systemInfoBottom: null,//底部栏判断

  }
})