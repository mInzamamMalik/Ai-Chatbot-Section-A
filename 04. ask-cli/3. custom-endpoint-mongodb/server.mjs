import express from "express";
import Alexa, { SkillBuilders } from 'ask-sdk-core';
import morgan from "morgan";
import { ExpressAdapter } from 'ask-sdk-express-adapter';
import mongoose from 'mongoose';


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
    const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
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
      skillName: "saylani skill",
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

const EmailIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'EmailIntent';
  },
  async handle(handlerInput) {
    const { serviceClientFactory, responseBuilder } = handlerInput;
    try {
      const upsServiceClient = serviceClientFactory.getUpsServiceClient();

      console.log("upsServiceClient: ", upsServiceClient);
      const profileEmail = await upsServiceClient.getProfileEmail();
      console.log("profileEmail: ", profileEmail);
      if (!profileEmail) {
        const noEmailResponse = `It looks like you are not having an email set. You can set your email from the companion app.`
        return responseBuilder
          .speak(noEmailResponse)
          .getResponse();
      }
      const speechResponse = `Your email is, ${profileEmail}`;
      return responseBuilder
        .speak(speechResponse)
        .getResponse();
    } catch (error) {
      console.log("error: ", JSON.stringify(error));
      if (true) {
        return responseBuilder
          .speak(messages.NOTIFY_MISSING_PERMISSIONS)
          .withAskForPermissionsConsentCard([EMAIL_PERMISSION])
          .getResponse();
      }
      console.log("error2: ", JSON.stringify(error));
      const response = responseBuilder.speak(messages.ERROR).getResponse();
      return response;
    }
  },
}



const deviceIdHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'deviceId';
  },
  handle(handlerInput) {

    let deviceId = Alexa.getDeviceId(handlerInput.requestEnvelope)
    console.log("deviceId: ", deviceId); // amzn1.ask.device.AEIIZKO24SOSURK7U32HYTGXRQND5VMWQTKZDZOVVKFVIBTHIDTGJNXGQLO5TKAITDM756X5AHOESWLLKZADIMJOAM43RKPADYXEHRMI7V6ESJPWWHE34E37GPJHHG2UVZSTUKF3XJUWD5FINAUTKIB5QBIQ
    const speakOutput = `your device id is ${deviceId}`

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};


const skillBuilder = SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    showMenuHandler,
    EmailIntentHandler,
    deviceIdHandler,
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





