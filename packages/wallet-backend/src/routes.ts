import express, { Request, Response } from 'express'
import passport from 'passport'
import { login, me, refresh, signup } from './auth/auth.service'
import { getCountryNames } from './rapyd/countries/countries.service'
import { getDocumentTypes } from './rapyd/documents/documents.service'
import {
  createWallet,
  updateProfile,
  verifyIdentity
} from './wallet/wallet.service'
import { assetRouter } from './asset/asset.route'
import { paymentPointerRouter } from './payment-pointer/payment-pointer.route'
import { accountRouter } from './account/account.route'
import { rafikiIntegrationRouter } from './rafiki/integration/rafiki-integration.routes'
import { incomingPaymentRouter } from './incoming-payment/incoming-payment.route'
import { outgoingPaymentRouter } from './outgoing-payment/outgoing-payment.route'
import { transactionsRouter } from './transaction/transaction.route'

export const mainRouter = express.Router()

mainRouter.use(function (req, _res, next) {
  req.setTimeout(500000, function () {
    // call back function is called when request timed out.
  })
  next()
})

mainRouter.post('/signup', signup)
mainRouter.post('/login', login)
mainRouter.post('/refresh', refresh)
mainRouter.get('/me', me)

mainRouter.post(
  '/wallet',
  passport.authenticate('jwt', { session: false }),
  createWallet
)

mainRouter.post(
  '/updateProfile',
  passport.authenticate('jwt', { session: false }),
  updateProfile
)

mainRouter.post(
  '/verify',
  passport.authenticate('jwt', { session: false }),
  verifyIdentity
)

mainRouter.get(
  '/documents',
  passport.authenticate('jwt', { session: false }),
  getDocumentTypes
)

mainRouter.use('/rafiki', rafikiIntegrationRouter)

mainRouter.get('/countries', getCountryNames)
mainRouter.get('/documents', getDocumentTypes)

mainRouter.use('/assets', assetRouter)
mainRouter.use('/accounts', accountRouter)
mainRouter.use('', paymentPointerRouter)
mainRouter.use('', incomingPaymentRouter)
mainRouter.use('', outgoingPaymentRouter)
mainRouter.use('', transactionsRouter)

mainRouter.use('*', (req: Request, res: Response) => {
  const err = Error(`Requested path ${req.path} not found`)
  res.status(404).send({
    success: false,
    message: `Requested path ${req.path} not found`,
    stack: err.stack
  })
})
