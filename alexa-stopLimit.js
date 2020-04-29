const StopLimitOrderIntentHandler = {
  // Triggers when user wants to execute a stop limit order
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'StopLimitOrderIntent';
  },
  async handle(handlerInput) {
   // Get user inputs and declare the Alpaca object
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const api = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
      paper: true
    });

    // Format inputs
    let sym = `${slots['sym_one'].value ? slots['sym_one'].value.split('.').join("") : ""}\
${slots['sym_two'].value ? slots['sym_two'].value.split('.').join("") : ""}\
${slots['sym_three'].value ? slots['sym_three'].value.split('.').join("") : ""}\
${slots['sym_four'].value ? slots['sym_four'].value.split('.').join("") : ""}\
${slots['sym_five'].value ? slots['sym_five'].value.split('.').join("") : ""}`.toUpperCase();
    if(slots['side'].value == "by") slots['side'].value = "buy";
    let tif = slots['time_in_force'].value.toLowerCase();

    // Create stop/limit order with user inputs
    if(slots["stop_limit"].value == "limit") {
      let resp = await api.createOrder({
        symbol: sym,
        qty: parseInt(slots['quantity'].value),
        side: slots['side'].value,
        type: "stop_limit",
        time_in_force: tif,
        limit_price: parseInt(slots['price_one'].value),
        stop_price: parseInt(slots['price_two'].value),
      }).then((resp) => {
        return `${slots["stop_limit"].value} order of ${slots['side'].value}, ${slots['quantity'].value}, ${sym.split("").join(", ")}, ${tif.split("").join(", ")}, at a limit price of ${slots['price_one'].value} and a stop price of ${slots['price_two'].value} sent.`;
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
  }
}