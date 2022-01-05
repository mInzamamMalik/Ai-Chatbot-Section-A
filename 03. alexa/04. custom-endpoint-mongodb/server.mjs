import express from "express";
import Alexa, { SkillBuilders } from 'ask-sdk-core';
import morgan from "morgan";
import { ExpressAdapter } from 'ask-sdk-express-adapter';
import mongoose from 'mongoose';
import axios from "axios";

mongoose.connect('mongodb+srv://dbuser:dbpassword@cluster0.nr4e4.mongodb.net/chatbotdb?retryWrites=true&w=majority');

const Usage = mongoose.model('Usage', {
  skillName: String,
  clientName: String,
  createdOn: { type: Date, default: Date.now },
});

const app = express();
app.use(morgan("dev"))
const PORT = process.env.PORT || 3000;


const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput = 'Fallback intent: Sorry, I had trouble doing what you asked. Please try again.';
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {

    var newUsage = new Usage({
      skillName: "food ordering skill",
      clientName: "saylani class",
    }).save();

    const speakOutput = 'Welcome to kababjees, I am your virtual assistant. you can ask for the menu';
    const reprompt = 'I am your virtual assistant. you can ask for the menu';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(reprompt)
      .withSimpleCard("Kababjees", speakOutput)
      .getResponse();
  }
};
const showMenuHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'showMenu';
  },
  handle(handlerInput) {
    const speakOutput = 'In the menu, we have Beef kabab, Mutton kabab, Chicken Reshmi kabab, Gola kabab and Seekh kabab. which one would you like to order?';
    const reprompt = 'we have Beef kabab, Mutton kabab, Chicken Reshmi kabab, Gola kabab and Seekh kabab.';
    const cardText = '1. Beef kabab \n2. Mutton kabab \n3. Chicken Reshmi kabab \n4. Gola kabab \n5. Seekh kabab.';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(reprompt)
      .withSimpleCard("Our Menu", cardText)
      .getResponse();
  }
};


const deviceIdHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'deviceId';
  },
  handle(handlerInput) {

    let deviceId = Alexa.getDeviceId(handlerInput.requestEnvelope)
    let userId = Alexa.getUserId(handlerInput.requestEnvelope)

    console.log("deviceId: ", deviceId); // amzn1.ask.device.AEIIZKO24SOSURK7U32HYTGXRQND5VMWQTKZDZOVVKFVIBTHIDTGJNXGQLO5TKAITDM756X5AHOESWLLKZADIMJOAM43RKPADYXEHRMI7V6ESJPWWHE34E37GPJHHG2UVZSTUKF3XJUWD5FINAUTKIB5QBIQ
    const speakOutput = `your device id is: ${deviceId} \n\n\nand your user id is: ${userId}`

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const EmailIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'EmailIntent';
  },
  async handle(handlerInput) {
    const { serviceClientFactory, responseBuilder } = handlerInput;

    const apiAccessToken = Alexa.getApiAccessToken(handlerInput.requestEnvelope)
    console.log("apiAccessToken: ", apiAccessToken);

    try {
      // https://developer.amazon.com/en-US/docs/alexa/custom-skills/request-customer-contact-information-for-use-in-your-skill.html#get-customer-contact-information

      const responseArray = await Promise.all([
        axios.get("https://api.amazonalexa.com/v2/accounts/~current/settings/Profile.email",
          { headers: { Authorization: `Bearer ${apiAccessToken}` } },
        ),
        axios.get("https://api.amazonalexa.com/v2/accounts/~current/settings/Profile.name",
          { headers: { Authorization: `Bearer ${apiAccessToken}` } },
        ),
      ])

      const email = responseArray[0].data;
      const name = responseArray[1].data;
      console.log("email: ", email);

      if (!email) {
        return handlerInput.responseBuilder
          .speak(`looks like you dont have an email associated with this device, please set your email in Alexa App Settings`)
          .getResponse();
      }
      return handlerInput.responseBuilder
        .speak(`Dear ${name}, your email is: ${email}`)
        .getResponse();

    } catch (error) {
      console.log("error code: ", error.response.status);

      if (error.response.status === 403) {
        return responseBuilder
          .speak('I am Unable to read your email. Please goto Alexa app and then goto Malik Resturant Skill and Grant Profile Permissions to this skill')
          .withAskForPermissionsConsentCard(["alexa::profile:email:read"]) // https://developer.amazon.com/en-US/docs/alexa/custom-skills/request-customer-contact-information-for-use-in-your-skill.html#sample-response-with-permissions-card
          .getResponse();
      }
      return responseBuilder
        .speak('Uh Oh. Looks like something went wrong.')
        .getResponse();
    }
  }
}

const PlaceOrderIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'PlaceOrder';
  },
  async handle(handlerInput) {


    const slots = handlerInput
      .requestEnvelope
      .request
      .intent
      .slots;

    const dishName = slots.dish.value;
    const qty = parseInt(slots.qty.value);

    console.log("dishName: ", dishName);
    console.log("qty: ", qty);







    const { serviceClientFactory, responseBuilder } = handlerInput;

    const apiAccessToken = Alexa.getApiAccessToken(handlerInput.requestEnvelope)
    console.log("apiAccessToken: ", apiAccessToken);

    try {
      // https://developer.amazon.com/en-US/docs/alexa/custom-skills/request-customer-contact-information-for-use-in-your-skill.html#get-customer-contact-information

      const responseArray = await Promise.all([
        axios.get("https://api.amazonalexa.com/v2/accounts/~current/settings/Profile.email",
          { headers: { Authorization: `Bearer ${apiAccessToken}` } },
        ),
        axios.get("https://api.amazonalexa.com/v2/accounts/~current/settings/Profile.name",
          { headers: { Authorization: `Bearer ${apiAccessToken}` } },
        ),
      ])

      const email = responseArray[0].data;
      const name = responseArray[1].data;
      console.log("email: ", email);

      if (!email) {
        return handlerInput.responseBuilder
          .speak(`looks like you dont have an email associated with this device, please set your email in Alexa App Settings`)
          .getResponse();
      }
      return handlerInput.responseBuilder
        .speak(`Dear ${name}, your email is: ${email}`)
        .getResponse();

    } catch (error) {
      console.log("error code: ", error.response.status);

      if (error.response.status === 403) {
        return responseBuilder
          .speak('I am Unable to read your email. Please goto Alexa app and then goto Malik Resturant Skill and Grant Profile Permissions to this skill')
          .withAskForPermissionsConsentCard(["alexa::profile:email:read"]) // https://developer.amazon.com/en-US/docs/alexa/custom-skills/request-customer-contact-information-for-use-in-your-skill.html#sample-response-with-permissions-card
          .getResponse();
      }
      return responseBuilder
        .speak('Uh Oh. Looks like something went wrong.')
        .getResponse();
    }
  }
}


const skillBuilder = SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    showMenuHandler,
    EmailIntentHandler,
    deviceIdHandler,
    PlaceOrderIntentHandler
  )
  .addErrorHandlers(
    ErrorHandler
  )
const skill = skillBuilder.create();
const adapter = new ExpressAdapter(skill, false, false);

app.post('/api/v1/webhook-alexa', adapter.getRequestHandlers());

app.use(express.json())
app.get('/profile', (req, res, next) => {
  res.send("this is a profile");
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});





