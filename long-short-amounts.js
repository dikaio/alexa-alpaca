// Determine amount to long/short based on total stock price of each bucket.
var equity;
await this.alpaca.getAccount().then((resp) => {
  equity = resp.equity;
}).catch((err) => {console.log(err.error);});
this.shortAmount = 0.30 * equity;
this.longAmount = Number(this.shortAmount) + Number(equity);