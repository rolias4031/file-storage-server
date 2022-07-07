const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const utils = require('../utils/utils')
const User = require('../models/userModel')
require('dotenv').config()
exports.signup = async (req, res, next) => {
  try {
    // validate the req
    serverValidation(req)
    // gather User info
    const email = req.body.email
    const password = req.body.password
    const confirmPw = req.body.confirmPw
    const name = req.body.name
    const profileType = req.body.profileType
    // compare passwords
    if (password !== confirmPw) {
      const error = new Error(utils.errors.passwordsDontMatch)
      error.statusCode = utils.codes.unprocessable
      throw error
    }
    // create User
    const hashedPw = await bcrypt.hash(password, 12)
    const user = new User({
      email: email,
      password: hashedPw,
      name: name,
      profileType: profileType
    })
    const newUser = await user.save()
    res.status(utils.codes.resourceCreated).json({
      message: utils.msg.signup,
      user: newUser
    })
  } catch (err) {
    catchErrorHandler(err, next)
  }
}

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email
    const password = req.body.password
    console.log(email, password)
    // find User with email
    const user = await User.findOne({ email: email })
    invalidAuthHandler(user, utils.errors.userNotFound, utils.codes.notFound)
    // check if passwords match
    const validPassword = await bcrypt.compare(password, user.password)
    invalidAuthHandler(validPassword, utils.errors.invalidPW, utils.codes.invalidAuth)
    // create web token
    const token = jwt.sign({
      email: user.email,
      userId: user._id.toString()
    },
    process.env.TOKEN_SECRET, { expiresIn: '1h' })
    // send response with token and userId
    res.status(utils.codes.success).json({
      message: utils.msg.login,
      token: token,
      userId: user._id.toString()
    })
  } catch (err) {
    catchErrorHandler(err, next)
  }
}

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.userId
    const password = req.body.password
    // find user
    const user = await User.findById(userId)
    invalidAuthHandler(user, utils.errors.userNotFound, utils.codes.notFound)
    // validate user creds
    const validPassword = await bcrypt.compare(password, user.password)
    invalidAuthHandler(validPassword, utils.errors.invalidPW, utils.codes.invalidAuth)
    // delete user
    await User.findByIdAndRemove(userId)
    res.status(utils.codes.success).json({
      message: utils.msg.deleted
    })
  } catch (err) {
    catchErrorHandler(err, next)
  }
}

exports.getUserProfile = async (req, res, next) => {
  try {
    const userId = req.userId
    const user = await User.findById(userId).populate('files').populate('sharedFiles')
    invalidAuthHandler(user, utils.errors.userNotFound, utils.codes.notFound)
    res.status(utils.codes.success).json({
      message: utils.msg.getProfile,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        memberSince: user.createdAt,
        profileType: user.profileType,
        files: user.files,
        sharedFiles: user.sharedFiles
      }
    })
  } catch (err) {
    catchErrorHandler(err, next)
  }
}

exports.editProfile = async (req, res, next) => {
  try {
    // validate the req
    serverValidation(req)
    // get req info
    const userId = req.userId
    const name = req.body.name
    const profileType = req.body.profileType
    // find user
    const user = await User.findById(userId)
    invalidAuthHandler(user, utils.errors.userNotFound, utils.codes.notFound)
    // edit profile
    user.name = name
    user.profileType = profileType
    const editedUser = await user.save()
    // response
    res.status(utils.codes.success).json({
      message: utils.msg.editProfile,
      user: editedUser
    })
  } catch (err) {
    catchErrorHandler(err, next)
  }
}

exports.changePassword = async (req, res, next) => {
  try {
    // validate the req
    serverValidation(req)
    // get req info
    const userId = req.userId
    const newPassword = req.body.newPassword
    const oldPassword = req.body.oldPassword
    const confirmPassword = req.body.confirmPassword
    // find and validate user
    const user = await User.findById(userId)
    invalidAuthHandler(user, utils.errors.userNotFound, utils.codes.notFound)
    // check password
    const passwordMatch = await bcrypt.compare(oldPassword, user.password)
    invalidAuthHandler(passwordMatch, utils.errors.invalidPW, utils.codes.invalidAuth)
    // check newPassword doesn't match old
    const newPasswordMatch = await bcrypt.compare(newPassword, user.password)
    if (newPasswordMatch) {
      const error = new Error(utils.errors.samePassword)
      error.statusCode = utils.codes.unprocessable
      throw error
    }
    // check confirm matches
    if (confirmPassword !== newPassword) {
      const error = new Error(utils.errors.passwordsDontMatch)
      error.statusCode = utils.codes.unprocessable
      throw error
    }
    const hashedPw = await bcrypt.hash(newPassword, 12)
    // change password
    user.password = hashedPw
    await user.save()
    // response
    res.status(utils.codes.success).json({
      message: utils.msg.changePassword
    })
  } catch (err) {
    catchErrorHandler(err, next)
  }
}

exports.changeEmail = async (req, res, next) => {
  try {
    // validate req
    serverValidation(req)
    // gather req info
    const userId = req.userId
    const newEmail = req.body.newEmail
    const confirmNewEmail = req.body.confirmNewEmail
    const password = req.body.password
    // check if newEmail available
    const emailUnavailable = await User.findOne({ email: newEmail })
    if (emailUnavailable) {
      const error = new Error(utils.errors.emailUnavailable)
      error.statusCode = utils.codes.unprocessable
      throw error
    }
    // check if valid user
    const user = await User.findById(userId)
    invalidAuthHandler(user, utils.errors.userNotFound, utils.codes.notFound)
    // check if valid password
    const passwordMatch = await bcrypt.compare(password, user.password)
    invalidAuthHandler(passwordMatch, utils.errors.invalidPW, utils.codes.invalidAuth)
    // check if newEmail and confirmNewEmail match
    if (newEmail !== confirmNewEmail) {
      const error = new Error(utils.errors.emailConfirmFailed)
      error.statusCode = utils.codes.unprocessable
      throw error
    }
    user.email = newEmail
    user.save()
    res.status(utils.codes.success).json({
      message: utils.msg.changeEmail
    })
  } catch (err) {
    catchErrorHandler(err, next)
  }
}

function catchErrorHandler (err, next) {
  if (!err.statusCode) {
    err.statusCode = utils.codes.serverError
  }
  next(err)
}

function invalidAuthHandler (auth, errorMsg, code) {
  if (!auth) {
    const error = new Error(errorMsg)
    error.statusCode = code
    throw error
  }
}

function serverValidation (req) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error(utils.errors.validationFailed)
    error.statusCode = utils.codes.unprocessable
    error.data = errors.array()
    throw error
  }
}
