"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const util = require("util");
const path = require("path");
const fs = require("fs");

let network = require("./network.js");

const app = express();
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cors());

const configPath = path.join(process.cwd(), "./config.json");
const configJSON = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(configJSON);

//use this identity to query
const appAdmin = config.appAdmin;

//get all assets in world state
app.get("/queryAll", async (req, res) => {
  let networkObj = await network.connectToNetwork(appAdmin, "queryContract");
  let response = await network.invoke(networkObj, true, "querow myAll", "");
  let parsedResponse = await JSON.parse(response);
  res.send(parsedResponse);
});

//get patient info, create patient object, and update state with their patientID
app.post("/registerPatient", async (req, res) => {
  console.log("req.body: ");
  console.log(req.body);
  let patientID = req.body.patientID;

  //first create the identity for the patient and add to wallet
  let response = await network.registerPatient(
    patientID,
    req.body.password,
    req.body.fullName
  );
  console.log("response from registerPatient: ");
  console.log(response);
  if (response.error) {
    res.statusCode = 500;
    res.send(response.error);
    return;
  } else {
    console.log("req.body.patientID");
    console.log(req.body.patientID);
    let networkObj = await network.connectToNetwork(patientID, "patientContract");

    if (networkObj.error) {
      res.statusCode = 500;
      res.send(networkObj.error);
      return;
    }

    req.body = JSON.stringify(req.body);
    let args = [req.body];
    
    //connect to network and update the state with patientID
    let invokeResponse = await network.invoke(
      networkObj,
      false,
      "createPatient",
      args
    );

    if (invokeResponse.error) {
      res.statusCode = 500;
      res.send(invokeResponse.error);
      return;
    } else {
      console.log("after network.invoke ");
      let parsedResponse = JSON.parse(invokeResponse);
      parsedResponse += ". Use patientID to login above.";
      res.send(parsedResponse);
    }
  } 
});

//get doctor info, create docot object, and update state with their doctorID
app.post("/registerDoctor", async (req, res) => {
  console.log("req.body: ");
  console.log(req.body);
  let patientID = req.body.doctorID;

  //first create the identity for the patient and add to wallet
  let response = await network.registerPatient(
    patientID,
    req.body.password,
    req.body.fullName
  );
  console.log("response from registerDoctor: ");
  console.log(response);
  if (response.error) {
    res.statusCode = 500;
    res.send(response.error);
    return;
  } else {
    console.log("req.body.doctorID");
    console.log(req.body.doctorID);
    let networkObj = await network.connectToNetwork(doctorID, "doctorContract");
    console.log("networkobj: ");
    console.log(networkObj);

    if (networkObj.error) {
      res.statusCode = 500;
      res.send(networkObj.error);
      return;
    }
    console.log("network obj");
    console.log(util.inspect(networkObj));

    req.body = JSON.stringify(req.body);
    let args = [req.body];
    //connect to network and update the state with patientID

    let invokeResponse = await network.invoke(
      networkObj,
      false,
      "createPatient",
      args
    );

    if (invokeResponse.error) {
      res.statusCode = 500;
      res.send(invokeResponse.error);
      return;
    } else {
      console.log("after network.invoke ");
      let parsedResponse = JSON.parse(invokeResponse);
      parsedResponse += ". Use patientID to login above.";
      res.send(parsedResponse);
    }
  }
});

app.listen(process.env.PORT || 8081);