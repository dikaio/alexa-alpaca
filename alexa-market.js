const MarketOrderIntentHandler = {
  // Triggers when user invokes a market order
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MarketOrderIntent';
  },
  async handle(handlerInput) {
    // Get user inputs and declare the Alpaca object
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const api = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
      paper: true
    });

    
    let input_stock = slots['stock'].value.toLowerCase()
    let stock = ""
    for(let i = 0; i < stock_dict.length; i++) {
      if(stock_dict[i][input_stock]) {
        stock = stock_dict[i][input_stock]
      }
    }
    if(stock == "") {
      stock = input_stock.split(" ").join("").split(".").join("").toUpperCase()
    }
    
    let valid_stock = false
    for(let j = 0; j < stock_dict.length; j++) {
      for(let key in stock_dict[j]) {
        if(stock_dict[j][key] == stock) {
          valid_stock = true
          break
        }
      }
    }
    if(!valid_stock) {
      return handlerInput.responseBuilder
      .speak(`Error: Invalid stock.  Stock ${stock} is not able to be traded.`)
      .getResponse();
    }
    if(slots['side'].value == "by") slots['side'].value = "buy";
    

    // Submit the market order using the Alpaca trading api
    let resp = await api.createOrder({
      symbol: stock,
      qty: parseInt(slots['quantity'].value),
      side: slots['side'].value,
      type: 'market',
      time_in_force: "day",
    }).then((resp) => {
      return `Market order of ${slots['side'].value}, ${slots['quantity'].value}, ${stock.split("").join(", ")}, day, sent.`;
    }).catch((err) => {
      return `Error: ${err.error.message}`;
    }).then((resp) => {
      return handlerInput.responseBuilder
      .speak(resp)
      .getResponse();
    });

    // Send verbal response back to user
    return resp;
  }
};