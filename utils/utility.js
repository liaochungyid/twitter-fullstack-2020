const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const imgur = require('imgur-node-api')

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

  sumLikes: arr => {
    let likes = 0
    arr.forEach(i => (likes += i))
    return likes
  }
}
