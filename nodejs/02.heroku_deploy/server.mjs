import express from "express";
const app = express();

app.get("/", (req, res) => {
    res.send("I am a hello world server");
})
app.get("/profile", (req, res) => {
    res.send("here is your profile");
})
app.get("/about", (req, res) => {
    res.send("some information about me");
})
app.listen(3000, () => {
    console.log(`server is running on port 3000`);
});