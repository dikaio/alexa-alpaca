async run(){
  // First, cancel any existing orders so they don't impact our buying power.
  var orders;
  await this.alpaca.getOrders({
    status: 'open', 
    direction: 'desc' 
  }).then((resp) => {
    orders = resp;
  }).catch((err) => {console.log(err.error);});
  var promOrders = [];
  orders.forEach((order) => {
    promOrders.push(new Promise(async (resolve, reject) => {
      await this.alpaca.cancelOrder(order.id).catch((err) => {console.log(err.error);});
      resolve();
    }));
  });
  await Promise.all(promOrders);

  // Wait for market to open.
  console.log("Waiting for market to open...");
  var promMarket = this.awaitMarketOpen();
  await promMarket;
  console.log("Market opened.");

  // Rebalance the portfolio every minute, making necessary trades.
  var spin = setInterval(async () => {

    // Figure out when the market will close so we can prepare to sell beforehand.
    await this.alpaca.getClock().then((resp) =>{
      var closingTime = new Date(resp.next_close.substring(0, resp.next_close.length - 6));
      var currTime = new Date(resp.timestamp.substring(0, resp.timestamp.length - 6));
      this.timeToClose = Math.abs(closingTime - currTime);
    }).catch((err) => {console.log(err.error);});

    if(this.timeToClose < (60000 * 15)) {
      // Close all positions when 15 minutes til market close.
      console.log("Market closing soon.  Closing positions.");

      await this.alpaca.getPositions().then(async (resp) => {
        var promClose = [];
        resp.forEach((position) => {
          promClose.push(new Promise(async (resolve, reject) => {
            var orderSide;
            if(position.side == 'long') orderSide = 'sell';
            else orderSide = 'buy';
            var quantity = Math.abs(position.qty);
            await this.submitOrder(quantity, position.symbol, orderSide);
            resolve();
          }));
        });

        await Promise.all(promClose);
      }).catch((err) => {console.log(err.error);});
      clearInterval(spin);
      console.log("Sleeping until market close (15 minutes).");
      setTimeout(() => {
        // Run script again after market close for next trading day.
        this.run();
      }, 60000*15);
    }
    else {
      // Rebalance the portfolio.
      await this.rebalance();
    }
  }, 60000);
}

// Spin until the market is open
awaitMarketOpen(){
  var prom = new Promise(async (resolve, reject) => {
    var isOpen = false;
    await this.alpaca.getClock().then(async (resp) => {
      if(resp.is_open) {
        resolve();
      }
      else {
        var marketChecker = setInterval(async () => {
          await this.alpaca.getClock().then((resp) => {
            isOpen = resp.is_open;
            if(isOpen) {
              clearInterval(marketChecker);
              resolve();
            } 
            else {
              var openTime = new Date(resp.next_open.substring(0, resp.next_close.length - 6));
              var currTime = new Date(resp.timestamp.substring(0, resp.timestamp.length - 6));
              this.timeToClose = Math.floor((openTime - currTime) / 1000 / 60);
              console.log(this.timeToClose + " minutes til next market open.")
            }
          }).catch((err) => {console.log(err.error);});
        }, 60000);
      }
    });
  });
  return prom;
}

// Submit an order if quantity is above 0.
async submitOrder(quantity,stock,side){
  var prom = new Promise(async (resolve,reject) => {
    if(quantity > 0){
      await this.alpaca.createOrder({
        symbol: stock,
        qty: quantity,
        side: side,
        type: 'market',
        time_in_force: 'day',
      }).then(() => {
        console.log("Market order of | " + quantity + " " + stock + " " + side + " | completed.");
        resolve(true);
      }).catch((err) => {
        console.log("Order of | " + quantity + " " + stock + " " + side + " | did not go through.");
        resolve(false);
      });
    }
    else {
      console.log("Quantity is <=0, order of | " + quantity + " " + stock + " " + side + " | not sent.");
      resolve(true);
    }
  });
  return prom;
}