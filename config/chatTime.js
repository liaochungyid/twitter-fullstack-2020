const moment = require('moment')

// 即時訊息(聊天框框)直接用 chatTime.chatTime(datetime)
// 信箱訊息(訊息框框)直接用 chatTime.msgTime(datetime)

const chatTime = {
  // 即時訊息直接用 chatTime.chatTime(datetime)
  chatTime: (datetime) => {
    // 與現在時間差距(秒)
    const timeOffset = (Date.now() - datetime.getTime())/1000

    if (timeOffset > 60) return chatTime.localTime(datetime)
    if (timeOffset > (60 * 60 * 24)) return chatTime.dayOutTime(datetime)
    return chatTime.justTime()
  },
  
  localTime: (datetime) => {
    // 下午 4:33
    let locale = datetime.toLocaleTimeString()
    cho = locale.split('')
    cho.splice(-3, 3)
    locale = ''
    cho.forEach(char => locale += char)
    
    return locale
  },
  
  dayOutTime: (datetime) => {
    // 11月12日 下午3:54 (超過一天的訊息)
    return chatTime.mailDate(datetime) + ' ' + chatTime.localTime(datetime)
  },
  
  justTime: (() => {
    // 剛剛
    return '剛剛'
  }),
  
  // 信箱訊息直接用 chatTime.msgTime(datetime)
  msgTime: (datetime) => {
    // 與現在時間差距(秒)
    const timeOffset = (Date.now() - datetime.getTime())/1000

    if (timeOffset < 1) return '1秒'   
    if (timeOffset < 60) return timeOffset + '秒'
    if (timeOffset < (60 * 60 * 24)) return chatTime.momentTime(datetime)

    return chatTime.mailDate(datetime)
  },

  momentTime: (datetime) => {
    // 距離發訊 幾秒前，幾分鐘，幾小時
    moment.updateLocale('zh-tw', { meridiem: datetime })
    return moment(datetime).fromNow()
  },

  mailDate: (datetime) => {
    // 11月12日
    return (
      datetime.getMonth() +
      '月' +
      datetime.getDate() +
      '日'
    )
  }
}

module.exports = chatTime