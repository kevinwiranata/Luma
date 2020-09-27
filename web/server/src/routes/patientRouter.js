"use strict";
const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const network = require("../network.js");

const patientRouter = express.Router();

const configPath = path.join(process.cwd(), "./config.json");
const configJSON = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(configJSON);

//use this identity to query
const appAdmin = config.appAdmin;

patientRouter.use(bodyParser.json());

//get patient info, create patient object, and update state with their patientID
patientRouter.route("/register").post(async (req, res) => {
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
    let networkObj = await network.connectToNetwork(
      patientID,
      "patientContract"
    );
    if (networkObj.error) {
      res.statusCode = 500;
      res.send(networkObj.error);
      return;
    }

    let args = [JSON.stringify(req.body)];

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
      let parsedResponse = JSON.parse(invokeResponse);
      parsedResponse += ". Use patientID to login above.";
      res.send(parsedResponse);
    }
  }
});

patientRouter.route("/login").post(async (req, res) => {
  let networkObj = await network.connectToNetwork(
    req.body.patientID,
    "patientContract"
  );
  if (networkObj.error) {
    res.statusCode = 500;
    res.send(networkObj.error);
    return;
  }

  let args = [JSON.stringify(req.body)];
  //connect to network and update the state with patientID
  let invokeResponse = await network.invoke(
    networkObj,
    true,
    "loginPatient",
    args
  );

  if (invokeResponse.error) {
    res.statusCode = 500;
    res.send(invokeResponse.error);
    return;
  } else {
    let parsedResponse = JSON.parse(invokeResponse);
    res.send(parsedResponse);
  }
});

module.exports = patientRouter;
