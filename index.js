const Static = require('koa-static')
const Koa = require('koa')

const crypto = require('crypto')
const PluginBtp = require('ilp-plugin-btp')
const { createReceiver } = require('ilp-protocol-psk2')

const app = new Koa()
const files = Static(process.env.SERVE_DIR || '/var/www/html')

const _secret = crypto.randomBytes(16).toString('hex')
const plugin = new PluginBtp({
  // TODO: moneyd
  server: process.env.ILP_PROVIDER || `btp+ws://:${_secret}@localhost:7768`
})

async function run () {
  console.log('connecting')
  await plugin.connect()

  const receiver = await createReceiver({
    plugin,
    paymentHandler: async (params) => {
      console.log('fulfilling. expectedValue=', params.expectedAmount,
        'prepare=', params.prepare)
      return params.accept()
    }
  })

  console.log('created receiver')

  async function handleSPSP (ctx, next) {
    if (ctx.get('Accept').indexOf('application/spsp+json') !== -1) {
      const details = receiver.generateAddressAndSecret()
      ctx.set('Content-Type', 'application/spsp+json')
      ctx.body = {
        destination_account: details.destinationAccount,
        shared_secret: details.sharedSecret.toString('base64'),
        // no `balance` object because this isn't an invoice
        // TODO: dynamically load ledger info
        ledger_info: {
          asset_code: 'XRP',
          asset_scale: 6
        },
        receiver_info: {
          name: 'Ben Sharafian'
        }
      }
    } else {
      return next()
    }
  }

  app
    .use(handleSPSP)
    .use(files)
    .listen(process.env.PORT || 8080)
}

run()
