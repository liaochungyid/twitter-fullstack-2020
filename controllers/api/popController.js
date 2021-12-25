const userService = require('../../services/userService')

module.exports = {
  getPops: async (req, res) => {
    const pops = await userService.getPopular(req, res)
    return res.json(pops)
  }
}
