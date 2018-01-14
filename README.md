# Static Server with SPSP

After running this on my site, `sharafian.com`, you can now pay me through SPSP
at `$sharafian.com`. (With [this module](https://github.com/sharafian/ilp-protocol-spsp)).

I wanted to run an SPSP receiver on the root of my personal server, so I made
this tool. It points a koa server at your static web root, and runs an SPSP
receiver that responds to any queries to `/` that have `Accept:
application/x-spsp-response` set.

**Note:** Because SPSP requires HTTPS, this server needs to be put behind another
service like nginx or Cloudflare in order to be safely useable. SPSP clients will
not allow connection to a non-HTTPS receiver.

```sh
npm install
npm install -g pm2

export PORT=8080
export ILP_PROVIDER="btp+ws://:<token>@btp.siren.sh/<ripple_address>"
export SERVE_DIR="/var/www/html/"
pm2 start index.js
```
