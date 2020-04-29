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

    let sym = `${slots['sym_one'].value ? slots['sym_one'].value : ""}${slots['sym_two'].value ? slots['sym_two'].value : ""}${slots['sym_three'].value ? slots['sym_three'].value : ""}${slots['sym_four'].value ? slots['sym_four'].value : ""}${slots['sym_five'].value ? slots['sym_five'].value : ""}`
    sym = sym.toUpperCase();
    // Submit the market order using the Alpaca trading api
    let resp = await api.createOrder({
      symbol: sym,
      qty: parseInt(slots['quantity'].value),
      side: slots['side'].value,
      type: 'market',
      time_in_force: slots['time_in_force'].value,
    }).then((resp) => {
      return `Market order of ${slots['side'].value}, ${slots['quantity'].value}, ${sym.split("").join(", ")} sent.`;
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