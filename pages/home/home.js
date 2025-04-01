// 引入工具函数和API
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    meetings: [],
    loading: true,
    filterStatus: 'upcoming', // 可选值: upcoming, past, all
    refreshing: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 检查是否已有用户信息
    if (getApp().globalData.userInfo) {
      this.setData({
        userInfo: getApp().globalData.userInfo,
        hasUserInfo: true
      })
    } else {
      // 监听全局用户信息更新
      getApp().userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    }
    
    // 获取会面列表
    this.fetchMeetings()
  },

  /**
   * 获取用户信息
   */
  getUserInfo: function(e) {
    if (e.detail.userInfo) {
      getApp().globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    }
  },

  /**
   * 获取会面列表
   */
  fetchMeetings: function() {
    this.setData({ loading: true })
    
    // 调用接口获取会议列表
    api.getMeetings(this.data.filterStatus)
      .then(res => {
        // 处理日期格式
        const meetings = res.data.map(meeting => {
          // 格式化日期显示
          meeting.formattedDate = util.formatDate(new Date(meeting.date))
          // 判断会议状态
          const today = new Date()
          const meetingDate = new Date(meeting.date)
          meeting.isPast = meetingDate < today
          return meeting
        })
        
        this.setData({
          meetings,
          loading: false,
          refreshing: false
        })
      })
      .catch(err => {
        console.error('获取会面列表失败', err)
        this.setData({
          loading: false,
          refreshing: false
        })
        wx.showToast({
          title: '获取会面失败',
          icon: 'none'
        })
      })
  },

  /**
   * 切换过滤状态
   */
  switchFilter: function(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      filterStatus: status
    }, () => {
      this.fetchMeetings()
    })
  },

  /**
   * 下拉刷新
   */
  onRefresh: function() {
    this.setData({ refreshing: true })
    this.fetchMeetings()
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
   * 跳转到创建会面
   */
  navigateToCreate: function() {
    wx.navigateTo({
      url: '/pages/create/create'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 每次显示页面时刷新会议列表
    this.fetchMeetings()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.fetchMeetings()
    wx.stopPullDownRefresh()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 可以添加加载更多逻辑
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