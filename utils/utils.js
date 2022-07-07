const codes = {
  success: 200,
  resourceCreated: 201,
  serverError: 500,
  unprocessable: 422,
  invalidAuth: 401,
  notFound: 404
}

const msg = {
  signup: 'NEW USER CREATED',
  login: 'LOGIN SUCCESS',
  deleted: 'DELETED',
  getProfile: 'FETCH SUCCESS',
  fileUploaded: 'FILE UPLOADED',
  editProfile: 'PROFILE UPDATED',
  changePassword: 'PASSWORD CHANGED',
  changeEmail: 'EMAIL CHANGED',
  fileRejected: 'SHARED FILE REJECTED',
  fileShared: 'FILE SHARED'
}

const errors = {
  invalidPW: 'INCORRECT PASSWORD',
  userNotFound: 'USER NOT FOUND',
  itemNotFound: 'ITEM NOT FOUND',
  noFileSent: 'NO FILE SENT',
  validationFailed: 'VALIDATION FAILED',
  samePassword: 'NEW PASSWORD CANNOT MATCH OLD PASSWORD',
  passwordsDontMatch: 'PASSWORDS DON\'T MATCH',
  emailUnavailable: 'EMAIL ALREADY IN USE, EITHER BY YOU OR SOMEONE ELSE.',
  emailConfirmFailed: 'CONFIRMATION DOES NOT MATCH EMAIL',
  invalidToken: 'INVALID TOKEN',
  notAuthenticated: 'NOT AUTHENTICATED',
  operationFailed: 'OPERATION FAILED'
}

exports.codes = codes
exports.msg = msg
exports.errors = errors
