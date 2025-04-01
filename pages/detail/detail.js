// 引入工具函数和API
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    meetingId: '',
    meeting: null,
    loading: true,
    userInfo: null,
    venueRecommendations: [],
    selectedVenue: null,
    loadingVenues: false,
    showVenueList: false,
    mapContext: null,
    markers: [],
    includeMyLocation: true,
    userLocation: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id) {
      this.setData({
        meetingId: options.id,
        userInfo: getApp().globalData.userInfo,
        userLocation: getApp().globalData.userLocation
      })
      
      // 获取会面详情
      this.fetchMeetingDetail()
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  /**
   * 获取会面详情
   */
  fetchMeetingDetail: function() {
    this.setData({ loading: true })
    
    api.getMeetingDetail(this.data.meetingId)
      .then(res => {
        // 处理日期格式
        const meeting = res.data
        meeting.formattedDate = util.formatDate(new Date(meeting.date))
        
        // 检查当前用户是否为创建者
        meeting.isCreator = meeting.creator.id === this.data.userInfo.id
        
        // 检查当前用户是否参与
        meeting.isParticipant = meeting.participants.some(p => p.id === this.data.userInfo.id)
        
        // 检查会面时间是否已过
        const meetingDate = new Date(`${meeting.date} ${meeting.time}`)
        meeting.isPast = meetingDate < new Date()
        
        this.setData({
          meeting,
          loading: false
        })
        
        // 设置地图标记
        this.setMapMarkers()
        
        // 如果会面没有确定地点且不是过期会面，获取推荐地点
        if (!meeting.venueName && !meeting.isPast) {
          this.fetchVenueRecommendations()
        }
      })
      .catch(err => {
        console.error('获取会面详情失败', err)
        this.setData({ loading: false })
        wx.showToast({
          title: '获取会面详情失败',
          icon: 'none'
        })
      })
  },

  /**
   * 设置地图标记
   */
  setMapMarkers: function() {
    if (!this.data.meeting) return
    
    const markers = []
    let markerIndex = 0
    
    // 如果有确定的会面地点
    if (this.data.meeting.venueLocation) {
      markers.push({
        id: markerIndex++,
        latitude: this.data.meeting.venueLocation.latitude,
        longitude: this.data.meeting.venueLocation.longitude,
        title: this.data.meeting.venueName,
        iconPath: '/images/markers/venue_marker.png',
        width: 30,
        height: 30
      })
    }
    
    // 添加参与者位置
    this.data.meeting.participants.forEach(participant => {
      if (participant.location) {
        markers.push({
          id: markerIndex++,
          latitude: participant.location.latitude,
          longitude: participant.location.longitude,
          title: participant.nickName,
          iconPath: '/images/markers/user_marker.png',
          width: 25,
          height: 25
        })
      }
    })
    
    // 添加当前用户位置
    if (this.data.includeMyLocation && this.data.userLocation) {
      markers.push({
        id: markerIndex++,
        latitude: this.data.userLocation.latitude,
        longitude: this.data.userLocation.longitude,
        title: '我的位置',
        iconPath: '/images/markers/my_location.png',
        width: 25,
        height: 25
      })
    }
    
    this.setData({ markers })
    
    // 如果有确定会面地点，定位到会面地点
    if (this.data.meeting.venueLocation) {
      this.moveToLocation(this.data.meeting.venueLocation)
    } 
    // 否则，如果有标记，定位到标记的平均位置
    else if (markers.length > 0) {
      const midpoint = util.calculateMidpoint(
        markers.map(marker => ({
          latitude: marker.latitude,
          longitude: marker.longitude
        }))
      )
      this.moveToLocation(midpoint)
    }
  },

  /**
   * 移动地图到指定位置
   */
  moveToLocation: function(location) {
    if (!this.data.mapContext) {
      this.data.mapContext = wx.createMapContext('meeting-map')
    }
    
    this.data.mapContext.moveToLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      success: () => {
        console.log('移动地图成功')
      },
      fail: (err) => {
        console.error('移动地图失败', err)
      }
    })
  },

  /**
   * 获取会面地点推荐
   */
  fetchVenueRecommendations: function() {
    // 确保有参与者位置数据
    const locations = this.data.meeting.participants
      .filter(p => p.location)
      .map(p => p.location)
    
    if (locations.length === 0) {
      console.log('没有足够的位置数据进行推荐')
      return
    }
    
    this.setData({ loadingVenues: true })
    
    // 计算位置中点
    const midpoint = util.calculateMidpoint(locations)
    
    // 请求推荐地点
    api.getVenueRecommendations({
      location: midpoint,
      meetingType: this.data.meeting.type || '一般会面',
      date: this.data.meeting.date,
      time: this.data.meeting.time,
      participantCount: this.data.meeting.participants.length
    })
    .then(res => {
      this.setData({
        venueRecommendations: res.data,
        loadingVenues: false
      })
    })
    .catch(err => {
      console.error('获取推荐地点失败', err)
      this.setData({ loadingVenues: false })
      wx.showToast({
        title: '获取推荐地点失败',
        icon: 'none'
      })
    })
  },

  /**
   * 选择推荐地点
   */
  selectVenue: function(e) {
    const venueId = e.currentTarget.dataset.id
    const venue = this.data.venueRecommendations.find(v => v.id === venueId)
    
    if (venue) {
      this.setData({
        selectedVenue: venue,
        showVenueList: false
      })
      
      // 更新地图标记
      const updatedMarkers = [...this.data.markers]
      
      // 移除原有的会面地点标记
      const venueMarkerIndex = updatedMarkers.findIndex(marker => marker.title === this.data.meeting.venueName)
      if (venueMarkerIndex > -1) {
        updatedMarkers.splice(venueMarkerIndex, 1)
      }
      
      // 添加新选择的地点标记
      updatedMarkers.push({
        id: updatedMarkers.length,
        latitude: venue.location.latitude,
        longitude: venue.location.longitude,
        title: venue.name,
        iconPath: '/images/markers/venue_marker.png',
        width: 30,
        height: 30
      })
      
      this.setData({ markers: updatedMarkers })
      
      // 移动地图到选中地点
      this.moveToLocation(venue.location)
    }
  },

  /**
   * 显示/隐藏推荐地点列表
   */
  toggleVenueList: function() {
    this.setData({
      showVenueList: !this.data.showVenueList
    })
  },

  /**
   * 确认会面地点
   */
  confirmVenue: function() {
    if (!this.data.selectedVenue) {
      wx.showToast({
        title: '请先选择地点',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '确认中',
    })
    
    const updatedMeeting = {
      ...this.data.meeting,
      venueName: this.data.selectedVenue.name,
      venueAddress: this.data.selectedVenue.address,
      venueLocation: this.data.selectedVenue.location,
      status: 'confirmed'
    }
    
    api.updateMeeting(this.data.meetingId, updatedMeeting)
      .then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '地点已确认',
          icon: 'success'
        })
        
        // 更新页面数据
        this.setData({
          meeting: updatedMeeting,
          selectedVenue: null
        })
      })
      .catch(err => {
        console.error('确认地点失败', err)
        wx.hideLoading()
        wx.showToast({
          title: '确认失败，请重试',
          icon: 'none'
        })
      })
  },

  /**
   * 加入会面
   */
  joinMeeting: function() {
    if (!this.data.userLocation) {
      wx.showToast({
        title: '请先授权位置信息',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '加入中',
    })
    
    api.joinMeeting(this.data.meetingId, this.data.userLocation)
      .then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '已加入会面',
          icon: 'success'
        })
        
        // 重新获取会面详情
        this.fetchMeetingDetail()
      })
      .catch(err => {
        console.error('加入会面失败', err)
        wx.hideLoading()
        wx.showToast({
          title: '加入失败，请重试',
          icon: 'none'
        })
      })
  },

  /**
   * 分享会面
   */
  shareMeeting: function() {
    // 在onShareAppMessage中处理
  },

  /**
   * 取消会面
   */
  cancelMeeting: function() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个会面吗？此操作不可撤销。',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '取消中',
          })
          
          api.updateMeeting(this.data.meetingId, {
            ...this.data.meeting,
            status: 'cancelled'
          })
            .then(res => {
              wx.hideLoading()
              wx.showToast({
                title: '会面已取消',
                icon: 'success'
              })
              
              setTimeout(() => {
                wx.navigateBack()
              }, 1500)
            })
            .catch(err => {
              console.error('取消会面失败', err)
              wx.hideLoading()
              wx.showToast({
                title: '取消失败，请重试',
                icon: 'none'
              })
            })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.data.mapContext = wx.createMapContext('meeting-map')
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
    this.fetchMeetingDetail()
    wx.stopPullDownRefresh()
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
    const meeting = this.data.meeting
    return {
      title: `邀请你参加"${meeting.title}"`,
      path: `/pages/detail/detail?id=${this.data.meetingId}`,
      imageUrl: '/images/share_card_bg.png'
    }
  }
})