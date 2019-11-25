const Alexa = require('ask-sdk-core');
const provider = require('./provider');

const SKILL_TITLE = "Universidades de España";

function getSlotValue(intentSlot) {
  const resolutions = intentSlot.resolutions.resolutionsPerAuthority;
  for (const resolution of resolutions) {
    if (resolution.status.code === "ER_SUCCESS_MATCH") {
      const firstIntentSlotValue = resolution.values[0].value;
      return firstIntentSlotValue.name;
    }
  }
  return null;
}

const UniversityQueryIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "UniversityQueryIntent"
  },

  async handle(handlerInput) {
    if (handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED') {
      return handlerInput.responseBuilder
        .addDelegateDirective()
        .getResponse();
    }

    const intent = handlerInput.requestEnvelope.request.intent;
    const autonomyName = getSlotValue(intent.slots["autonomyName"]);
    
    const universityList = await provider.readUniversityFile();

    if (!autonomyName) {
      const autonomies = provider.filterAutonomies(universityList);
      const speechText = `Esa comunidad autónoma no tiene ninguna universidad. Puedes elegir entre ${autonomies.join(', ')}. ` +
        '¿De qué comunidad quieres saber las universidades que tiene?'
      return handlerInput.responseBuilder
        .addElicitSlotDirective('autonomyName')
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }

    const universities = provider.filterAutonomyUniversities(universityList, autonomyName);
    const universitiesNames = universities.map(university => university["Universidad"]);

    const speechText = `La comunidad autónoma tiene ${universities.length} universidades: ${universitiesNames.join(', ')}`
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withShouldEndSession(true)
      .getResponse();
  }
};

const UniversityDataQueryIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "UniversityDataQueryIntent"
  },

  async handle(handlerInput) {
    if (handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED') {
      return handlerInput.responseBuilder
        .addDelegateDirective()
        .getResponse();
    }

    const intent = handlerInput.requestEnvelope.request.intent;
    const universityName = getSlotValue(intent.slots["universityName"]);

    if (!universityName) {
      const speechText = 'No puedo encontrar esa universidad. Dime una que exista.'
      return handlerInput.responseBuilder
        .addElicitSlotDirective('universityName')
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }

    const universityList = await provider.readUniversityFile();
    const university = provider.findUniversity(universityList, universityName);

    const speechText = `La ${university["Universidad"]} con sede principal en ${university["Sede principal"]} fué fundada en ${university["Fundación"]}. Esta universidad es ${university["Tipo"]}`
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withShouldEndSession(true)
      .getResponse();
  }
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    const universityList = await provider.readUniversityFile();
    const autonomies = provider.filterAutonomies(universityList);

    const speechText = 'Bienvenido a Universidades de España, di "dame una lista de universidades" ' + 
      'o "dame una lista de las universidades" seguido de la comunidad autónoma. ' +
      'También me puedes decir "dime información de" seguido de la universidad. ' +
      `Las comunidades autónomas con alguna universidad son ${autonomies.join(', ')}. ` + 
      'Ahora bien, ¿que quieres hacer?'

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(SKILL_TITLE, speechText)
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'Esta skill te da información de las universidades que hay en una Comunidad Autónoma. ' +
      'Me puedes decir "dame una lista de universidades" o "dame una lista de las universidades" seguido de la comunidad autónoma. ' +
      'También me puedes decir "dime información de" seguido de la universidad y te diré cuando fue fundada junto a otros datos. ¿Que quieres hacer?'

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(SKILL_TITLE, speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = '¡Hasta luego!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(SKILL_TITLE, speechText)
      .withShouldEndSession(true)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended: ${handlerInput}`);
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);

    const speechText = 'Ha ocurrido un error, inténtalo mas tarde.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

let skill;

exports.handler = async function (event, context) {
  console.log(`SKILL REQUEST ${JSON.stringify(event)}`);

  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        UniversityQueryIntentHandler,
        UniversityDataQueryIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
      )
      .addErrorHandlers(ErrorHandler)
      .create();
  }

  const response = await skill.invoke(event, context);
  console.log(`SKILL RESPONSE ${JSON.stringify(response)}`);

  return response;
};