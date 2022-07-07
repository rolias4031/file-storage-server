const express = require('express')
const validation = require('../validation/validation')

const authController = require('../controllers/authController')
const isAuth = require('../middleware/isAuth')
const router = express.Router()

router.post('/signup', validation.signup, authController.signup)
router.post('/login', authController.login)
router.delete('/delete', isAuth, authController.deleteUser)
router.get('/user-profile', isAuth, authController.getUserProfile)
router.put('/edit-profile/', isAuth, validation.editProfile, authController.editProfile)
router.put('/change-password/', isAuth, validation.changePassword, authController.changePassword)
router.put('/change-email/', isAuth, validation.changeEmail, authController.changeEmail)

module.exports = router
