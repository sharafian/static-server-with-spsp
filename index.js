const Static = require('koa-static')
const Koa = require('koa')

const crypto = require('crypto')
const PluginBtp = require('ilp-plugin-btp')
const ILP = require('ilp') // TODO: PSK2

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

  const receiverSecret = crypto.randomBytes(32)
  const listener = await ILP.PSK.listen(plugin, { receiverSecret }, (params) => {
    console.log('fulfilling. transfer=', JSON.stringify(params.transfer))
    return params.fulfill()
  })

  console.log('listener', listener)

  async function handleSPSP (ctx, next) {
    if (ctx.get('Accept').indexOf('application/x-spsp-response') !== -1) {
      ctx.body = {
        destination_account: listener.destinationAccount,
        shared_secret: listener.sharedSecret,
        // TODO: dynamically load ledger info
        ledger_info: {
          currency_code: 'XRP',
          currency_scale: '6'
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
