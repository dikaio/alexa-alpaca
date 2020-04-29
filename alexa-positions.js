const PositionsIntentHandler = {
  // Triggers when user wants to look up positions
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PositionsIntent';
  },
  async handle(handlerInput) {
    // Get user inputs and declare the Alpaca object
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const api = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
      paper: true
    });

    // Lookup positions and craft response
    let resp = await api.getPositions().then((positions) => {
      if(positions.length > 0) {
        var speakOutput = "Listing positions.  ";
        positions.forEach((position,i) => {
          let sym = position.symbol.split("").join(", ");
          speakOutput += `Position ${i + 1}: ${sym}, ${position.qty}, ${position.side} position, average entry price of ${parseFloat(position.avg_entry_price).toFixed(2)}.`;
        });
        return speakOutput;
      }
      else {
        return "No open positions.";
      }
    }).catch((err) => {
      return `Error: ${err.error.message}`;
    }).then((resp) => {
      // Send verbal response to user
      return handlerInput.responseBuilder
        .speak(resp)
        .getResponse();
    });

    return resp;
  }
};