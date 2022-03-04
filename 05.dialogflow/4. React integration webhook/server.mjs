import express from "express";
import cors from "cors";
import dialogflow from '@google-cloud/dialogflow';
import gcHelper from "google-credentials-helper"
import { WebhookClient, Card, Suggestion } from 'dialogflow-fulfillment';


gcHelper();
const sessionClient = new dialogflow.SessionsClient();

const app = express();
app.use(cors())
app.use(express.json())


const PORT = process.env.PORT || 7001;

app.post("/talktochatbot", async (req, res) => {

    const projectId = "saylani-class-delete-this"
    const sessionId = req.body.sessionId || "session123"
    const query = req.body.text;
    const languageCode = "en-US"

    console.log("query: ", query, req.body);

    // The path to identify the agent that owns the created intent.
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );

    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: languageCode,
            },
        },
    };
    try {
        const responses = await sessionClient.detectIntent(request);
        // console.log("responses: ", responses);
        // console.log("resp: ", responses[0].queryResult.fulfillmentText);    
        res.send({
            text: responses[0].queryResult.fulfillmentText
        });

    } catch (e) {
        console.log("error while detecting intent: ", e)
    }
})

app.post("/webhook", (req, res) => {

    const agent = new WebhookClient({ request: req, response: res });

    function welcome(agent) {
        // agent.add(new Card({
        //     title: 'Vibrating molecules',
        //     imageUrl: "https://media.nationalgeographic.org/assets/photos/000/263/26383.jpg",
        //     text: 'Did you know that temperature is really just a measure of how fast molecules are vibrating around?! 😱',
        //     buttonText: 'Temperature Wikipedia Page',
        //     buttonUrl: "https://sysborg.com"
        // })
        // );
        agent.add('Welcome to the Weather Assistant!');
        agent.add('you can ask me name, or weather updates');
        agent.add(new Suggestion('what is your name'));
        agent.add(new Suggestion('Weather update'));
        agent.add(new Suggestion('Cancel'));
    }

    function weather(agent) {
        // Get parameters from Dialogflow to convert
        const cityName = agent.parameters.cityName;

        console.log(`User requested to city ${cityName}`);

        //TODO: Get weather from api

        // Compile and send response
        agent.add(`in ${cityName} its 27 degree centigrade, would you like to know anything else?`);
        agent.add(new Suggestion('What is your name'));
        agent.add(new Suggestion('Hi'));
        agent.add(new Suggestion('Cancel'));
    }

    function fallback(agent) {
        agent.add('Woah! Its getting a little hot in here.');
        agent.add(`I didn't get that, can you try again?`);
    }

    let intentMap = new Map(); // Map functions to Dialogflow intent names
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('weather', weather);
    intentMap.set('Default Fallback Intent', fallback);
    agent.handleRequest(intentMap);

})









// app.post("/webhook", (req, res) => {

//     const params = req.body.queryResult.parameters;

//     console.log("params.cityName: ", params.cityName)

//     // TODO: make api call to weather server

//     res.send({
//         "fulfillmentText": `response from webhok. weather of ${params.cityName} is 17°C.
//                             thank you for calling weather app. good bye.`,

//         "fulfillmentMessages": [
//             {
//                 "text": {
//                     "text": [
//                         `response from webhoook weather of ${params.cityName} is 17°C.
//                         thank you for calling weather app. good bye.`
//                     ]
//                 }
//             }
//         ]
//     })
// })


app.get("/profile", (req, res) => {
    res.send("here is your profile");
})
app.get("/about", (req, res) => {
    res.send("some information about me");
})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});