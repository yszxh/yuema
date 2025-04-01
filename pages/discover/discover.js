// 引入工具函数和API
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    publicMeetings: [],
    popularVenues: [],
    loading: true,
    loadingMore: false,
    hasMoreMeetings: true,
    currentPage: 1,
    pageSize: 10,
    userLocation: null,
    categories: [
      { id: 'all', name: '全部' },
      { id: 'coffee', name: '咖啡' },
      { id: 'restaurant', name: '餐厅' },
      { id: 'entertainment', name: '娱乐' },
      { id: 'outdoor', name: '户外' }
    ],
    selectedCategory: 'all'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户位置
    this.setData({
      userLocation: getApp().globalData.userLocation
    })
    
    if (!this.data.userLocation) {
      this.getUserLocation()
    } else {
      this.fetchData()
    }
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
        
        // 获取位置成功后加载数据
        this.fetchData()
      },
      fail: err => {
        console.error('获取位置失败', err)
        wx.showToast({
          title: '请授权位置信息以获取周边活动',
          icon: 'none'
        })
        
        // 即使没有位置也加载数据
        this.fetchData()
      }
    })
  },

  /**
   * 获取数据
   */
  fetchData: function() {
    // 同时获取公开会面和热门场所
    Promise.all([
      this.fetchPublicMeetings(),
      this.fetchPopularVenues()
    ])
    .then(() => {
      this.setData({ loading: false })
    })
    .catch(err => {
      console.error('获取数据失败', err)
      this.setData({ loading: false })
    })
  },

  /**
   * 获取公开会面
   */
  fetchPublicMeetings: function(refresh = false) {
    const page = refresh ? 1 : this.data.currentPage
    
    // 如果是刷新，重置相关状态
    if (refresh) {
      this.setData({
        publicMeetings: [],
        currentPage: 1,
        hasMoreMeetings: true
      })
    }
    
    return new Promise((resolve, reject) => {
      // 检查是否还有更多数据加载
      if (!this.data.hasMoreMeetings && !refresh) {
        resolve()
        return
      }
      
      const params = {
        page,
        pageSize: this.data.pageSize,
        category: this.data.selectedCategory === 'all' ? undefined : this.data.selectedCategory
      }
      
      // 如果有位置信息，添加到请求参数
      if (this.data.userLocation) {
        params.latitude = this.data.userLocation.latitude
        params.longitude = this.data.userLocation.longitude
      }
      
      api.getPublicMeetings(params)
        .then(res => {
          const meetings = res.data.map(meeting => {
            // 格式化日期
            meeting.formattedDate = util.formatDate(new Date(meeting.date))
            // 计算与用户的距离
            if (this.data.userLocation && meeting.venueLocation) {
              meeting.distance = util.calculateDistance(
                this.data.userLocation.latitude,
                this.data.userLocation.longitude,
                meeting.venueLocation.latitude,
                meeting.venueLocation.longitude
              )
              // 格式化距离显示
              meeting.distanceText = meeting.distance > 1000 
                ? (meeting.distance / 1000).toFixed(1) + ' 公里' 
                : Math.round(meeting.distance) + ' 米'
            }
            return meeting
          })
          
          // 更新数据
          this.setData({
            publicMeetings: refresh ? meetings : [...this.data.publicMeetings, ...meetings],
            currentPage: page + 1,
            hasMoreMeetings: meetings.length === this.data.pageSize,
            loadingMore: false
          })
          
          resolve()
        })
        .catch(err => {
          console.error('获取公开会面失败', err)
          this.setData({ loadingMore: false })
          reject(err)
        })
    })
  },

  /**
   * 获取热门场所
   */
  fetchPopularVenues: function() {
    return new Promise((resolve, reject) => {
      const params = {}
      
      // 如果有位置信息，添加到请求参数
      if (this.data.userLocation) {
        params.latitude = this.data.userLocation.latitude
        params.longitude = this.data.userLocation.longitude
      }
      
      // 如果选择了分类，添加到请求参数
      if (this.data.selectedCategory !== 'all') {
        params.category = this.data.selectedCategory
      }
      
      api.getPopularVenues(params)
        .then(res => {
          const venues = res.data.map(venue => {
            // 计算与用户的距离
            if (this.data.userLocation && venue.location) {
              venue.distance = util.calculateDistance(
                this.data.userLocation.latitude,
                this.data.userLocation.longitude,
                venue.location.latitude,
                venue.location.longitude
              )
              // 格式化距离显示
              venue.distanceText = venue.distance > 1000 
                ? (venue.distance / 1000).toFixed(1) + ' 公里' 
                : Math.round(venue.distance) + ' 米'
            }
            return venue
          })
          
          this.setData({ popularVenues: venues })
          resolve()
        })
        .catch(err => {
          console.error('获取热门场所失败', err)
          reject(err)
        })
    })
  },

  /**
   * 切换分类
   */
  changeCategory: function(e) {
    const category = e.currentTarget.dataset.category
    
    if (category !== this.data.selectedCategory) {
      this.setData({
        selectedCategory: category,
        loading: true
      })
      
      this.fetchData()
    }
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 可能需要刷新数据
    if (!this.data.loading) {
      this.fetchData()
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
    this.fetchPublicMeetings(true)
      .then(() => {
        wx.stopPullDownRefresh()
      })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMoreMeetings && !this.data.loadingMore) {
      this.setData({ loadingMore: true })
      this.fetchPublicMeetings()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '探索附近的活动和热门场所',
      path: '/pages/discover/discover'
    }
  }
})