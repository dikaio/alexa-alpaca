// Get percent changes of the stock prices over the past 10 minutes.
getPercentChanges(allStocks){
  var length = 10;
  var promStocks = [];
  allStocks.forEach((stock) => {
    promStocks.push(new Promise(async (resolve, reject) => {
      await this.alpaca.getBars('minute', stock.name, {limit: length}).then((resp) => {
        stock.pc  = (resp[stock.name][length - 1].c - resp[stock.name][0].o) / resp[stock.name][0].o;
      }).catch((err) => {console.log(err.error);});
      resolve();
    }));
  });
  return promStocks;
}

// Mechanism used to rank the stocks, the basis of the Long-Short Equity Strategy.
async rank(){
  // Ranks all stocks by percent change over the past 10 minutes (higher is better).
  var promStocks = this.getPercentChanges(this.allStocks);
  await Promise.all(promStocks);

  // Sort the stocks in place by the percent change field (marked by pc).
  this.allStocks.sort((a, b) => {return a.pc - b.pc;});
}