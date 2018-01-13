# Static Server with SPSP

After running this on my site, `sharafian.com`, you can now pay me through SPSP
at `$sharafian.com`. (With this [ILP
PR](https://github.com/interledgerjs/ilp/pull/126)).

I wanted to run an SPSP receiver on the root of my personal server, so I made
this tool. It points a koa server at your static web root, and runs an SPSP
receiver that responds to any queries to `/` that have `Accept:
application/x-spsp-response` set.

```sh
npm install
npm install -g pm2

export PORT=8080
export ILP_PROVIDER="btp+ws://:<token>@btp.siren.sh/<ripple_address>"
export SERVE_DIR="/var/www/html/"
pm2 start index.js
```
