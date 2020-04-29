const OrdersIntentHandler = {
  // Triggers when user wants to look up orders
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OrdersIntent';
  },
  async handle(handlerInput) {
    // Get user inputs and declare the Alpaca object
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const api = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
      paper: true
    });

    // Lookup orders using Alpaca trade API and craft a response
    let resp = await api.getOrders().then((orders) => {
      if(orders.length > 0) {
        var speakOutput = "Listing open orders. ";
        orders.forEach((order,i) => {
          let sym = order.symbol.split("").join(", ");
          speakOutput += `Order ${i + 1}: ${sym}, ${order.qty}, ${order.type} order, ${order.side}, ${order.filled_qty} shares filled.  `;
        });
        return speakOutput;
      }
      else {
        return "No open orders.";
      }
    }).catch((err) => {
      return `Error: ${err.error.message}`;
    }).then((resp) => {
      // Send verbal response back to user
      return handlerInput.responseBuilder
        .speak(resp)
        .getResponse();
    });

    return resp;
  }
};