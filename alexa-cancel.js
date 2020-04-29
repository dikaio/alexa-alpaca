const CancelOrderIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CancelOrderIntent';
  },
  async handle(handlerInput) {
    // Get user inputs and declare the Alpaca object
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const api = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
      paper: true
    });

    const orders = await api.getOrders({
      status: "open",
      limit: 1,
    });

    // Get the most recent order and cancel it
    if(orders.length == 0){
      return handlerInput.responseBuilder
      .speak("No orders to cancel.")
      .getResponse();
    } else {
      await api.cancelOrder(orders[0].id);

      // Send verbal response to user
      const speakOutput = "Order canceled.";
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};