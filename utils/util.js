const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 格式化日期，返回年、月、日
const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}

// 计算两个位置之间的距离（米）
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // 地球半径，单位km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // 距离，单位km
  return d * 1000 // 转换为米
}

const deg2rad = deg => {
  return deg * (Math.PI / 180)
}

// 计算多个位置的中点
const calculateMidpoint = locations => {
  if (!locations || locations.length === 0) {
    return null
  }
  
  if (locations.length === 1) {
    return locations[0]
  }

  let totalLat = 0
  let totalLon = 0

  locations.forEach(location => {
    totalLat += location.latitude
    totalLon += location.longitude
  })

  return {
    latitude: totalLat / locations.length,
    longitude: totalLon / locations.length
  }
}

// 生成唯一ID
const generateUniqueId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

module.exports = {
  formatTime,
  formatDate,
  calculateDistance,
  calculateMidpoint,
  generateUniqueId
}