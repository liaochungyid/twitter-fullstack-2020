module.exports = {
  time: datetime => {
    return datetime.toLocaleTimeString()
  },

  date: datetime => {
    return datetime.toLocaleDateString('zh-TW')
  },

  timeOrDatetime: datetime => {
    const now = new Date(Date.now()).toLocaleDateString('zh-TW')
    const input = datetime.toLocaleDateString('zh-TW')
    if (now !== input) {
      return input + ' ' + datetime.toLocaleTimeString()
    } else {
      return datetime.toLocaleTimeString()
    }
  }
}
