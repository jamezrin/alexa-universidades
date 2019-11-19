const Alexa = require('ask-sdk-core');
const path = require('path');
const fs = require('fs');

const universitiesFile = path.resolve(__dirname, 'universities.json');

const SKILL_TITLE = "Universidades de España";

function getSlotValueId(intentSlot) {
  const resolutions = intentSlot.resolutions.resolutionsPerAuthority;
  for (const resolution of resolutions) {
    if (resolution.status.code === "ER_SUCCESS_MATCH") {
      const firstIntentSlotValue = resolution.values[0].value;
      return firstIntentSlotValue.id;
    }
  }
}

function makeDistroList(distroRanking, rankingPage, itemsPerPage = 10) {
  const startPosition = rankingPage * itemsPerPage;
  const endingPosition = startPosition + itemsPerPage;

  var distroListText = '';
  for (var i = startPosition; i < endingPosition; i++) {
    const distro = distroRanking.distros[i];

    if (i % itemsPerPage > 0) {
      distroListText += ' ';
    }

    distroListText += `La <say-as interpret-as="ordinal">${distro.position}</say-as> distro es <lang xml:lang="en-US">${distro.name}</lang> con ${distro.hits} votos.`;
  }

  return distroListText;
}

const UniversityQueryIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "UniversityQueryIntent"
  },

  handle(handlerInput) {
    const intent = handlerInput.requestEnvelope.request.intent;
    const periodSlot = intent.slots["autonomyName"];

    const speechText = `test`
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Bienvenido a Universidades de España, di "dame una lista de universidades" ' + 
      'o "dame una lista de las universidades de la Comunidad de Madrid". ' +
      'También me puedes decir "dime información de" seguido de la universidad. ' +
      `Las comunidades autónomas con alguna universidad son ${}`

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
      'Me puedes decir "dame una lista de universidades" o "dame una lista de las universidades de la Comunidad de Madrid. ' +
      'También me puedes decir "dime información de" seguido de la universidad y te diré cuando fue fundada junto a otros datos.'

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

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes() || {};
    sessionAttributes.rankingPage = 0;
    sessionAttributes.rankingSlot = null;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

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