const AccountIntentHandler = {
  // Triggers when user wants to lookup account info
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AccountIntent';
  },
  async handle(handlerInput) {
    // Get user inputs and declare the Alpaca object
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const api = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
      paper: true
    });

    // Get account from Alpaca trade API and craft response
    const account = await api.getAccount();
    const speakOutput = `Account info: current equity is ${account.equity}, current cash is ${account.cash}, buying power is ${account.buying_power}, portfolio value is ${account.portfolio_value}, currency is ${account.currency}.`;
    
    // Send verbal response to user
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};