Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 图标类型
    type: {
      type: String,
      value: ''
    },
    // 图标颜色
    color: {
      type: String,
      value: '#333333'
    },
    // 图标大小
    size: {
      type: Number,
      value: 24
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 图标类型对应的路径映射
    icons: {
      home: '/images/icons/home.png',
      home_active: '/images/icons/home_active.png',
      create: '/images/icons/create.png',
      create_active: '/images/icons/create_active.png',
      discover: '/images/icons/discover.png',
      discover_active: '/images/icons/discover_active.png',
      profile: '/images/icons/profile.png',
      profile_active: '/images/icons/profile_active.png',
      location: '/images/icons/location.png',
      time: '/images/icons/time.png',
      people: '/images/icons/people.png',
      edit: '/images/icons/edit.png',
      delete: '/images/icons/delete.png',
      share: '/images/icons/share.png',
      close: '/images/icons/close.png',
      add: '/images/icons/add.png',
      check: '/images/icons/check.png',
      star: '/images/icons/star.png',
      star_filled: '/images/icons/star_filled.png',
      arrow_right: '/images/icons/arrow_right.png',
      calendar: '/images/icons/calendar.png',
      settings: '/images/icons/settings.png',
      info: '/images/icons/info.png'
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 点击图标时触发
     */
    onClick() {
      this.triggerEvent('click')
    }
  }
})