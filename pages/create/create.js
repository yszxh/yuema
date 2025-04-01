// 引入工具函数和API
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    description: '',
    date: '',
    time: '',
    participants: [],
    isLoading: false,
    currentStep: 0,
    steps: ['基本信息', '邀请好友', '确认'],
    userLocation: null,
    userInfo: null,
    datePickerOpen: false,
    timePickerOpen: false,
    today: '', // 当前日期字符串，用于日期选择器的最小值
    friends: [] // 好友列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取当前用户信息
    this.setData({
      userInfo: getApp().globalData.userInfo
    })
    
    // 获取当前日期作为默认值和日期选择器的最小值
    const today = new Date()
    const todayStr = util.formatDate(today)
    this.setData({
      date: todayStr,
      today: todayStr,
      time: '18:00'
    })
    
    // 获取用户位置
    this.getUserLocation()
    
    // 加载好友列表
    this.loadFriends()
  },

  /**
   * 获取用户当前位置
   */
  getUserLocation: function() {
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        const location = {
          latitude: res.latitude,
          longitude: res.longitude
        }
        this.setData({
          userLocation: location
        })
        getApp().globalData.userLocation = location
      },
      fail: err => {
        console.error('获取位置失败', err)
        wx.showToast({
          title: '获取位置失败，请授权位置信息',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 加载好友列表
   */
  loadFriends: function() {
    // 这里应该调用获取好友列表的API
    // 由于API可能尚未实现，这里模拟一些好友数据
    const mockFriends = [
      {
        id: 'friend1',
        nickName: '张三',
        avatarUrl: '/images/avatars/avatar1.png'
      },
      {
        id: 'friend2',
        nickName: '李四',
        avatarUrl: '/images/avatars/avatar2.png'
      },
      {
        id: 'friend3',
        nickName: '王五',
        avatarUrl: '/images/avatars/avatar3.png'
      }
    ]
    
    this.setData({
      friends: mockFriends
    })
  },

  /**
   * 输入会面标题
   */
  inputTitle: function(e) {
    this.setData({
      title: e.detail.value
    })
  },

  /**
   * 输入会面描述
   */
  inputDescription: function(e) {
    this.setData({
      description: e.detail.value
    })
  },

  /**
   * 选择日期
   */
  bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    })
  },

  /**
   * 选择时间
   */
  bindTimeChange: function(e) {
    this.setData({
      time: e.detail.value
    })
  },

  /**
   * 选择好友
   */
  toggleFriend: function(e) {
    const friendId = e.currentTarget.dataset.id
    const participants = [...this.data.participants]
    
    const index = participants.findIndex(p => p.id === friendId)
    
    if (index > -1) {
      // 如果已经在参与者列表中，则移除
      participants.splice(index, 1)
    } else {
      // 否则添加到参与者列表
      const friend = this.data.friends.find(f => f.id === friendId)
      participants.push(friend)
    }
    
    this.setData({
      participants
    })
  },

  /**
   * 检查基本信息是否完成
   */
  checkBasicInfo: function() {
    if (!this.data.title) {
      wx.showToast({
        title: '请输入会面标题',
        icon: 'none'
      })
      return false
    }
    
    if (!this.data.date) {
      wx.showToast({
        title: '请选择会面日期',
        icon: 'none'
      })
      return false
    }
    
    if (!this.data.time) {
      wx.showToast({
        title: '请选择会面时间',
        icon: 'none'
      })
      return false
    }
    
    return true
  },

  /**
   * 下一步
   */
  nextStep: function() {
    if (this.data.currentStep === 0 && !this.checkBasicInfo()) {
      return
    }
    
    const nextStep = this.data.currentStep + 1
    if (nextStep < this.data.steps.length) {
      this.setData({
        currentStep: nextStep
      })
    }
  },

  /**
   * 上一步
   */
  prevStep: function() {
    const prevStep = this.data.currentStep - 1
    if (prevStep >= 0) {
      this.setData({
        currentStep: prevStep
      })
    }
  },

  /**
   * 创建会面
   */
  createMeeting: function() {
    if (this.data.isLoading) {
      return
    }
    
    this.setData({
      isLoading: true
    })
    
    // 准备会面数据
    const meeting = {
      title: this.data.title,
      description: this.data.description,
      date: this.data.date,
      time: this.data.time,
      creator: this.data.userInfo,
      participants: [
        {
          ...this.data.userInfo,
          location: this.data.userLocation
        },
        ...this.data.participants
      ],
      status: 'pending' // 状态：pending, confirmed, completed, cancelled
    }
    
    // 调用创建会面API
    api.createMeeting(meeting)
      .then(res => {
        this.setData({
          isLoading: false
        })
        
        wx.showToast({
          title: '创建成功',
          icon: 'success'
        })
        
        // 返回首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/home/home'
          })
        }, 1500)
      })
      .catch(err => {
        console.error('创建会面失败', err)
        this.setData({
          isLoading: false
        })
        
        wx.showToast({
          title: '创建失败，请重试',
          icon: 'none'
        })
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
    return {
      title: '使用"约吗"创建智能会面',
      path: '/pages/home/home'
    }
  }
})