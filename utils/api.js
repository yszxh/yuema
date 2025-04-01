// 引入全局app实例，获取全局数据
const app = getApp()

// 封装请求函数
const request = (url, method, data, header = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiBaseUrl}${url}`,
      method,
      data,
      header: {
        'content-type': 'application/json',
        ...header
      },
      success: res => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(res)
          showError(`请求失败(${res.statusCode})`)
        }
      },
      fail: err => {
        reject(err)
        showError('网络请求失败')
      }
    })
  })
}

// 显示错误信息
const showError = (message) => {
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
}

// GET请求
const get = (url, params = {}, header = {}) => {
  return request(url, 'GET', params, header)
}

// POST请求
const post = (url, data = {}, header = {}) => {
  return request(url, 'POST', data, header)
}

// PUT请求
const put = (url, data = {}, header = {}) => {
  return request(url, 'PUT', data, header)
}

// DELETE请求
const del = (url, data = {}, header = {}) => {
  return request(url, 'DELETE', data, header)
}

// 获取用户信息
const getUserInfo = () => {
  return get('/user/info')
}

// 登录
const login = (code) => {
  return post('/user/login', { code })
}

// 更新用户信息
const updateUserInfo = (userInfo) => {
  return put('/user/info', userInfo)
}

// 创建会面
const createMeeting = (meetingData) => {
  return post('/meetings', meetingData)
}

// 获取会面列表
const getMeetings = (status = 'all') => {
  return get('/meetings', { status })
}

// 获取会面详情
const getMeetingDetail = (meetingId) => {
  return get(`/meetings/${meetingId}`)
}

// 更新会面信息
const updateMeeting = (meetingId, meetingData) => {
  return put(`/meetings/${meetingId}`, meetingData)
}

// 删除会面
const deleteMeeting = (meetingId) => {
  return del(`/meetings/${meetingId}`)
}

// 加入会面
const joinMeeting = (meetingId, userLocation) => {
  return post(`/meetings/${meetingId}/join`, { userLocation })
}

// 获取场地推荐
const getVenueRecommendations = (params) => {
  return get('/venues/recommendations', params)
}

// 获取场地详情
const getVenueDetail = (venueId) => {
  return get(`/venues/${venueId}`)
}

// 导出接口
module.exports = {
  get,
  post,
  put,
  del,
  getUserInfo,
  login,
  updateUserInfo,
  createMeeting,
  getMeetings,
  getMeetingDetail,
  updateMeeting,
  deleteMeeting,
  joinMeeting,
  getVenueRecommendations,
  getVenueDetail
}