import errors from '@twreporter/errors'
import express from 'express'
import middlewareCreator from './middlewares'
import envVars from '../../environment-variables'

const statusCodes = {
  ok: 200,
  unauthorized: 401,
  internalServerError: 500,
}

/**
 *  This function creates a mini app.
 *  This mini app aims to handle requests' authentication and authorization.
 *
 *  It provides `/access_token` route, which will response access token
 *  if the request contains valid firebase ID token, and that firebase token
 *  refers to a valid member in our Israfel member system.
 *
 *  It also adds authorization middleware on `/api/graphql` route.
 *  By verifying access token, it authorizes the request
 *  and decodes the access token payload.
 *
 *  The decoded payload could be used in the lists and fields for
 *  KeystoneJS6 access control.
 *
 *  @param {Object} opts
 *  @param {string} opts.gcpProjectId
 *  @param {string} opts.firebaseProjectId
 *  @param {string} opts.memberApiUrl
 *  @param {string} opts.jwtSecret
 *  @return {express.Router}
 */
export function createApp({
  gcpProjectId,
  firebaseProjectId,
  memberApiUrl,
  jwtSecret,
}) {
  // create express mini app
  const router = express.Router()

  // api route for granting access token
  router.post(
    '/access-token',
    middlewareCreator.createLoggerMw(gcpProjectId),
    middlewareCreator.verifyIdTokenByFirebaseAdmin({ firebaseProjectId }),
    middlewareCreator.queryMemberInfoFromIsrafel({ apiUrl: memberApiUrl }),
    middlewareCreator.signAccessToken({ jwtSecret: envVars.jwt.secret }),
    /**
     *  @param {express.Request} req
     *  @param {express.Response} res
     */
    (req, res) => {
      const payload = res.locals.accessTokenPayload
      res.status(statusCodes.ok).send({
        status: 'success',
        data: payload,
      })
    },
    /**
     *  @param {Error} err
     *  @param {express.Request} req
     *  @param {express.Response} res
     *  @param {express.NextFunction} next
     */
    (err, req, res, next) => {
      switch (err.name) {
        case 'AuthError': {
          console.log(
            JSON.stringify({
              severity: 'NOTICE',
              message: 'Authorization token is invalid.' + err.message,
              ...res.locals.globalLogFields,
            })
          )
          return res.status(statusCodes.unauthorized).send({
            status: 'fail',
            data: err.message + ' Authorization token is invalid.',
          })
        }
        case 'SignJWTError':
        case 'MemberInfoError': {
          console.log(
            JSON.stringify({
              severity: 'Error',
              message: errors.helpers.printAll(err, {
                withStack: true,
                withPayload: true,
              }),
              ...res.locals.globalLogFields,
            })
          )
          return res.status(statusCodes.internalServerError).send({
            status: 'error',
            error: err.message,
          })
        }
        default: {
          next(err)
          return
        }
      }
    }
  )

  router.post(
    '/api/graphql',
    middlewareCreator.createLoggerMw(gcpProjectId),
    (req, res, next) => {
      if (req.header('Authorization')) {
        // get to next middleware
        next()
        return
      }
      // bypass remaining middlewares
      next('route')
    },
    middlewareCreator.verfiyAccessToken({
      jwtSecret,
    }),
    /**
     *  @param {Error} err
     *  @param {express.Request} req
     *  @param {express.Response} res
     *  @param {express.NextFunction} next
     */
    (err, req, res, next) => {
      switch (err.name) {
        case 'AuthError': {
          console.log(
            JSON.stringify({
              severity: 'NOTICE',
              message: 'Authorization token is invalid: ' + err.message,
              ...res.locals.globalLogFields,
            })
          )
          return res.status(statusCodes.unauthorized).send({
            status: 'fail',
            data: 'Authorization token is invalid: ' + err.message,
          })
        }
        default: {
          next(err)
          return
        }
      }
    }
  )

  router.use(
    /**
     *  error handler
     *  @param {Error} err
     *  @param {express.Request} req
     *  @param {express.Response} res
     *  @param {express.NextFunction} next
     */
    (err, req, res, next) => { // eslint-disable-line
      const annotatingError = errors.helpers.wrap(
        err,
        'UnknownError',
        'Express error handler catches an unknown error'
      )

      const entry = Object.assign(
        {
          severity: 'ERROR',
          // All exceptions that include a stack trace will be
          // integrated with Error Reporting.
          // See https://cloud.google.com/run/docs/error-reporting
          message: errors.helpers.printAll(annotatingError, {
            withStack: true,
            withPayload: true,
          }),
        },
        res.locals.globalLogFields
      )
      console.error(JSON.stringify(entry))
      res.status(statusCodes.internalServerError).send('Internal server error')
    }
  )

  return router
}
