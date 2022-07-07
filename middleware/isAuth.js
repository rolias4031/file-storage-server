const jwt = require('jsonwebtoken')
const utils = require('../utils/utils')
require('dotenv').config()

module.exports = (req, res, next) => {
  const token = req.get('Authorization').split(' ')[1]
  let decodedToken
  try { // catches expiry
    decodedToken = jwt.verify(token, process.env.TOKEN_SECRET)
  } catch (error) {
    error.statusCode = utils.codes.invalidAuth
    throw error
  }
  if (!decodedToken) {
    const error = new Error(utils.errors.invalidToken)
    error.statusCode = utils.codes.invalidAuth
    throw error
  }
  req.userId = decodedToken.userId
  next()
}
