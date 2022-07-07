const { body } = require('express-validator')
const User = require('../models/userModel')

const config = {
  minLen: 2,
  minLenPw: 5
}

const utils = {
  invalidEmail: 'INVALID EMAIL',
  typePersonal: 'PERSONAL',
  typeBusiness: 'BUSINESS',
  emailTaken: 'EMAIL ALREADY IN USE'
}

const errors = {
  FIRST_NAME: 'INVALID FIRST NAME',
  LAST_NAME: 'INVALID LAST NAME',
  PROFILE_TYPE: 'INVALID PROFILE_TYPE',
  PASSWORD: 'INVALID PASSWORD',
  EMAIL: 'INVALID EMAIL'
}

exports.signup = [
  body('email').isEmail()
    .withMessage(errors.EMAIL)
    .custom(async (value) => {
      const userDoc = await User.findOne({ email: value })
      if (userDoc) {
        return Promise.reject(utils.emailTaken)
      }
    })
    .normalizeEmail(),
  body('name.first').trim().isAlpha().withMessage(errors.FIRST_NAME),
  body('name.last').trim().isAlpha().withMessage(errors.LAST_NAME),
  body('password').trim().isLength({ min: config.minLenPw }).withMessage(errors.PASSWORD),
  body('profileType').isIn([utils.typePersonal, utils.typeBusiness]).withMessage(errors.PROFILE_TYPE)
]

exports.editProfile = [
  body('name.first').trim().isAlpha().withMessage(errors.FIRST_NAME),
  body('name.last').trim().isAlpha().withMessage(errors.LAST_NAME),
  body('profileType').isIn([utils.typePersonal, utils.typeBusiness]).withMessage(errors.PROFILE_TYPE)
]

exports.changePassword = [
  body('newPassword').trim().isLength({ min: config.minLenPw }).withMessage(errors.PASSWORD)
]

exports.changeEmail = [
  body('newEmail').trim().isEmail().withMessage(errors.EMAIL),
  body('confirmNewEmail').trim()
]
