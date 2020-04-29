const ClearIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ClearIntent';
  },
  async handle(handlerInput) {
    // Get user inputs and declare the Alpaca object
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const api = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
      paper: true
    });
    
    // Clear all positions or orders
    var speakOutput = "";
    if(slots["position_order"].value == "positions") {
      let positions = await api.getPositions();
      positions.forEach((position) => {
        api.createOrder({
          symbol: position.symbol,
          qty: position.qty,
          side: (position.side == "long" ? "sell" : "buy"),
          type: "market",
          time_in_force: "day",
        });
      });
      speakOutput = "Position clearing orders sent.";
    } else if (slots["position_order"].value == "orders"){
      await api.cancelAllOrders();
      speakOutput = "Order cancels sent.";
    }       

    // Send verbal response to user
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};