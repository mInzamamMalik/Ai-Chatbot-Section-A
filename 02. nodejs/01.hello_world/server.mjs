import express from 'express';
const app = express()
const port = 3000

app.use((req,res,next)=>{
    console.log("a request came", Date.now());
    next()
})

app.get('/profile', (req, res) => {
  res.send('here is your profile')
})
app.get('/home', (req, res) => {
    res.send('here is your home')
})
app.get('/', (req, res) => {
    res.send('Hi I am a hello world Server program')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

// deploy this server to heroku cloud
// read: https://devcenter.heroku.com/articles/getting-started-with-nodejs