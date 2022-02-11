import express from "express";
// const MessagingResponse = require('twilio').twiml.MessagingResponse;
import twilio from 'twilio';



const app = express();

// app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("I am a hello world server");
})


app.post("/twiliowebhook", (req, res) => {

    // console.log("req: ", JSON.stringify(req.body));

    console.log("message: ", req.body.Body);

   // TODO: ask dialogflow what to respond
   
   
    let twiml = new twilio.twiml.MessagingResponse()
    twiml.message('The Robots are coming! Head for the hills!');

    res.header('Content-Type', 'text/xml');
    res.send(twiml.toString());
})


app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});