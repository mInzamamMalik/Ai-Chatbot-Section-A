import logo from './logo.svg';
import './App.css';
import React from 'react';
import { useEffect, useState } from "react"
const axios = require('axios');
const apiKey = "363a0329911c1b074081245aae1023c3";




function BusinessCard(props) {

  return (
    <div>
      Name: {props.name} <br />
      {props.des} <br />
      {props.email} - {props.phone} <br />
      {props.website}
      <br />
      <br />
    </div>

  );
}

function App() {

  const [weatherData, setWeatherData] = useState({})

  // const [value1, value2] = ["pakistan", "india"]


  useEffect(() => {


    axios.get(`https://api.openweathermap.org/data/2.5/weather?q=karachi&appid=${apiKey}&units=metric`)
      .then((response) => {
        console.log("response", response.data);

        setWeatherData(response.data);

        // setWeatherData((prevousValue) => {
        //   return response.data
        // });


      }).catch(e => {
        console.log("error: ", e);

        setWeatherData({
          name: "karachi",
          main: {
            temp_max: 25,
            temp_min: 10,
            temp: 15,
          }
        });

      })



  }, [])


  return (
    <div>

      <div>

        {weatherData?.name}
        <br />
        {/* {weatherData?.weather[0]?.description} */}
        <br />
        {weatherData?.main?.temp_max}
        <br />
        {weatherData?.main?.temp}
        <br />
        {weatherData?.main?.temp_min}
        <br />
      </div>





      {/* <BusinessCard
        name="Malik"
        des="Senior Instructor"
        email="malik@sysborg.com"
        phone="+92-302-2004480"
        website="https://sysborg.com"
      ></BusinessCard>


      <BusinessCard
        name="James Bond"
        des="Mi6 double O agent"
        email="james@mi6.com"
        phone="unknown"
        website="no webiste"
      />
 */}

    </div>
  );
}







export default App;
