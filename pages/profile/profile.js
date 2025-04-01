// 引入工具函数和API
const api = require('../../utils/api.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    myMeetings: {
      upcoming: [],
      past: []
    },
    loading: true,
    activeTab: 'upcoming', // upcoming, past
    functionList: [
      { 
        id: 'settings', 
        name: '设置', 
        icon: 'settings',
        url: '/pages/settings/settings'
      },
      { 
        id: 'feedback', 
        name: '反馈', 
        icon: 'edit',
        url: '/pages/feedback/feedback'
      },
      { 
        id: 'about', 
        name: '关于', 
        icon: 'info',
        url: '/pages/about/about'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 检查是否支持新版获取用户信息接口
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    
    // 检查是否已有用户信息
    if (getApp().globalData.userInfo) {
      this.setData({
        userInfo: getApp().globalData.userInfo,
        hasUserInfo: true
      })
      
      // 获取我的会面列表
      this.fetchMyMeetings()
    } else {
      // 监听全局用户信息更新
      getApp().userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        
        // 获取我的会面列表
        this.fetchMyMeetings()
      }
    }
  },

  /**
   * 使用新版接口获取用户信息
   */
  getUserProfile: function() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        getApp().globalData.userInfo = res.userInfo
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        
        // 更新服务器上的用户信息
        api.updateUserInfo(res.userInfo)
          .then(res => {
            console.log('用户信息更新成功')
          })
          .catch(err => {
            console.error('用户信息更新失败', err)
          })
        
        // 获取我的会面列表
        this.fetchMyMeetings()
      }
    })
  },

  /**
   * 获取我的会面列表
   */
  fetchMyMeetings: function() {
    this.setData({ loading: true })
    
    // 获取我创建或参与的会面
    api.getMeetings('all')
      .then(res => {
        const today = new Date()
        const upcoming = []
        const past = []
        
        res.data.forEach(meeting => {
          const meetingDate = new Date(`${meeting.date} ${meeting.time}`)
          if (meetingDate >= today) {
            upcoming.push(meeting)
          } else {
            past.push(meeting)
          }
        })
        
        this.setData({
          myMeetings: {
            upcoming,
            past
          },
          loading: false
        })
      })
      .catch(err => {
        console.error('获取会面列表失败', err)
        this.setData({ loading: false })
        wx.showToast({
          title: '获取会面失败',
          icon: 'none'
        })
      })
  },

  /**
   * 切换标签页
   */
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab
    })
  },

  /**
   * 跳转到会面详情
   */
  navigateToDetail: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id
    })
  },

  /**
   * 跳转到功能页面
   */
  navigateToFunction: function(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({ url })
  },

  /**
   * 创建新会面
   */
  createMeeting: function() {
    wx.navigateTo({
      url: '/pages/create/create'
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
    // 如果已登录，每次显示页面时刷新会面列表
    if (this.data.hasUserInfo) {
      this.fetchMyMeetings()
    }
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
    if (this.data.hasUserInfo) {
      this.fetchMyMeetings()
      setTimeout(() => {
        wx.stopPullDownRefresh()
      }, 1000)
    } else {
      wx.stopPullDownRefresh()
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 暂不处理分页加载
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '约吗 - 智能聚会组织工具',
      path: '/pages/home/home'
    }
  }
})