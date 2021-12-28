const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const imgur = require('imgur-node-api')
const moment = require('moment')

module.exports = {
  uploadToImgur: file => {
    imgur.setClientID(IMGUR_CLIENT_ID)
    return new Promise((resolve, reject) => {
      imgur.upload(file.path, (err, res) => {
        if (err) {
          reject(err)
        }
        resolve(res.data.link)
      })
    })
  },

  toTweetTime: time => {
    return moment(time)
      .format('a h:mm [·] LL')
      .replace('pm', '下午')
      .replace('am', '上午')
  },

  sumLikes: arr => {
    let likes = 0
    arr.forEach(i => (likes += i))
    return likes
  }
}
