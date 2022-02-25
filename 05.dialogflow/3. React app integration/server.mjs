import express from "express";
import cors from "cors";
import dialogflow from '@google-cloud/dialogflow';

const sessionClient = new dialogflow.SessionsClient();

const app = express();
app.use(cors())
app.use(express.json())
app.use('/', express.static(path.join(__dirname, 'web/build')))


const PORT = process.env.PORT || 7001;

app.post("/talktochatbot", async (req, res) => {

    const projectId = "saylani-class-delete-this"
    const sessionId = req.body.sessionId || "session123"
    const query = req.body.text;
    const languageCode = "en-US"

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
    const responses = await sessionClient.detectIntent(request);

    console.log("responses: ", responses);

    console.log("resp: ", responses[0].queryResult.fulfillmentText);


    res.send({
        text: responses[0].queryResult.fulfillmentText
    });

})
app.get("/profile", (req, res) => {
    res.send("here is your profile");
})
app.get("/about", (req, res) => {
    res.send("some information about me");
})

app.get("/**", (req, res, next) => {
    res.sendFile(path.join(__dirname, "./web/build/index.html"))
})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});