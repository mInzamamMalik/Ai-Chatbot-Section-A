import express from "express";
import cors from "cors";
import dialogflow from '@google-cloud/dialogflow';
import gcHelper from "google-credentials-helper"

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

    const params = req.body.queryResult.parameters;

    console.log("params.cityName: ", params.cityName)

    // TODO: make api call to weather server

    res.send({
        "fulfillmentText": `response from webhok. weather of ${params.cityName} is 17°C.
                            thank you for calling weather app. good bye.`,

        "fulfillmentMessages": [
            {
                "text": {
                    "text": [
                        `response from webhoook weather of ${params.cityName} is 17°C.
                        thank you for calling weather app. good bye.`
                    ]
                }
            }
        ]
    })
})


app.get("/profile", (req, res) => {
    res.send("here is your profile");
})
app.get("/about", (req, res) => {
    res.send("some information about me");
})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});