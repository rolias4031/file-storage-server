const express = require('express')
const multer = require('multer')

const isAuth = require('../middleware/isAuth')
const uploadController = require('../controllers/uploadController')

const router = express.Router()

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const filter = (req, file, cb) => {
  const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

const upload = multer({ storage: fileStorage, fileFilter: filter })

router.post('/upload', isAuth, upload.single('file'), uploadController.uploadFile)
router.delete('/delete-file', isAuth, uploadController.deleteFile)
router.put('/reject-shared-file', isAuth, uploadController.rejectSharedFile)
router.get('/download-file/:fileId', isAuth, uploadController.downloadFile)
router.put('/share-file', isAuth, uploadController.shareFile)

module.exports = router
