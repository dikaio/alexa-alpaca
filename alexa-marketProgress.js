// Graciously provided by Andrew Kim <github.com/andrewkim316>
const MarketOrderInProgressIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
    && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MarketOrderIntent'
    && Alexa.getDialogState(handlerInput.requestEnvelope) !== 'COMPLETED';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .addDelegateDirective()
      .getResponse();
  }
}