const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const imgur = require('imgur-node-api')

module.exports = {
  uploadToImgur: (filePath) => {
    imgur.setClientID(IMGUR_CLIENT_ID)
    return new Promise((resolve, reject) => {
      imgur.upload(filePath, (err, res) => {
        if (err) {
          reject(err)
        }
        resolve(res.data.link)
      })
    })
  }
}
