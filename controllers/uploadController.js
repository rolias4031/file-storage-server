const path = require('path')
const fs = require('fs')

const utils = require('../utils/utils')

const File = require('../models/fileModel')
const User = require('../models/userModel')

exports.uploadFile = async (req, res, next) => {
  // add validation
  try {
    const file = req.file
    invalidAuthHandler(file, utils.errors.noFileSent, utils.codes.unprocessable)
    const userId = req.userId
    //
    // create and save new File
    const newFile = new File({
      name: file.filename,
      path: file.path,
      owner: req.userId
    })
    const resultFile = await newFile.save()
    //
    // update User.files array
    const user = await User.findById(userId, 'files')
    invalidAuthHandler(user, utils.errors.userNotFound, utils.codes.notFound, file)
    const update = { files: [...user.files, resultFile._id] }
    const updatedUser = await User.findByIdAndUpdate(userId, update, { new: true })
    // update sharedUser.sharedFiles array
    let sharedWith = req.body.sharedWith
    if (sharedWith) {
      sharedWith = await User.findOne({ email: sharedWith }, 'sharedFiles')
      invalidAuthHandler(sharedWith, utils.errors.userNotFound, utils.codes.notFound, file)
      const update = { sharedFiles: [...sharedWith.sharedFiles, resultFile._id] }
      sharedWith = await User.findByIdAndUpdate(sharedWith._id, update, { new: true })
    }
    res.status(utils.codes.success).json({
      message: utils.msg.fileUploaded,
      resultFile: resultFile,
      oldFiles: user.files,
      updatedUser: updatedUser,
      updatedSharedUser: sharedWith
    })
  } catch (error) {
    // delete uploaded file
    const filePath = path.join(path.dirname(__dirname), error.file.path)
    await fs.unlink(filePath, (error) => {
      if (error) {
        error.message = utils.errors.operationFailed
        error.statusCode = utils.codes.unprocessable
        throw error
      }
    })
    catchErrorHandler(error, next)
  }
}

exports.deleteFile = async (req, res, next) => {
  try {
    const fileId = req.body.fileId
    const fileToDelete = await File.findByIdAndRemove(fileId)
    invalidAuthHandler(fileToDelete, utils.errors.itemNotFound, utils.codes.notFound)
    const dir = path.join(path.dirname(__dirname), fileToDelete.path)
    await fs.unlink(dir, (error) => {
      if (error) {
        error.message = utils.errors.operationFailed
        error.statusCode = utils.codes.unprocessable
        throw error
      }
    })
    res.status(utils.codes.success).json({
      message: utils.msg.deleted
    })
  } catch (error) {
    catchErrorHandler(error, next)
  }
}

exports.rejectSharedFile = async (req, res, next) => {
  try {
    const fileIdToReject = req.body.fileIdToReject
    const userId = req.userId
    const user = await User.findById(userId, 'sharedFiles')
    invalidAuthHandler(user, utils.errors.userNotFound, utils.codes.notFound)
    const newSharedFiles = user.sharedFiles.filter((file) => {
      return file._id.toString() !== fileIdToReject
    })
    const update = { sharedFiles: newSharedFiles }
    const updatedUser = await User.findByIdAndUpdate(userId, update, { new: true })
    invalidAuthHandler(updatedUser, utils.errors.userNotFound, utils.codes.notFound)
    res.status(utils.codes.success).json({
      message: utils.msg.fileRejected,
      updatedUser: updatedUser
    })
  } catch (error) {
    catchErrorHandler(error, next)
  }
}

exports.downloadFile = async (req, res, next) => {
  try {
    // increment download count
    const fileId = req.params.fileId
    const fileToDownload = await File.findById(fileId)
    invalidAuthHandler(fileToDownload, utils.errors.itemNotFound, utils.codes.notFound)
    fileToDownload.downloadCount += 1
    await fileToDownload.save()
    const filePath = path.join(path.dirname(__dirname), fileToDownload.path)
    // res.sendFile(filePath)
    fs.readFile(filePath, (error, data) => {
      if (error) {
        throw error
      }
      res.send(data)
    })
  } catch (error) {
    catchErrorHandler(error, next)
  }
}

exports.shareFile = async (req, res, next) => {
  try {
    const fileId = req.body.fileId
    const file = await File.findById(fileId)
    const sharedUserEmail = req.body.sharedUserEmail
    const sharedUser = await User.findOne({ email: sharedUserEmail })
    invalidAuthHandler(sharedUser, utils.errors.userNotFound, utils.codes.notFound)
    const oldSharedFiles = sharedUser.sharedFiles
    const update = { sharedFiles: [...oldSharedFiles, file._id] }
    const updatedUser = await User.findByIdAndUpdate(sharedUser._id, update, { new: true })
    res.status(utils.codes.success).json({
      message: utils.msg.fileShared,
      updatedUser: updatedUser
    })
  } catch (error) {
    catchErrorHandler(error, next)
  }
}

function invalidAuthHandler (auth, errorMsg, code, file = null) {
  if (!auth) {
    const error = new Error(errorMsg)
    error.statusCode = code
    error.file = file
    throw error
  }
}

function catchErrorHandler (err, next) {
  if (!err.statusCode) {
    err.statusCode = utils.codes.serverError
  }
  next(err)
}
