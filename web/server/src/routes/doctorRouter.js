"use strict";
const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const network = require("../network.js");

const doctorRouter = express.Router();

const configPath = path.join(process.cwd(), "./config.json");
const configJSON = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(configJSON);

//use this identity to query
const appAdmin = config.appAdmin;

doctorRouter.use(bodyParser.json());

//get doctor info, create docot object, and update state with their doctorID
doctorRouter.route("/register").post(async (req, res) => {
  let doctorID = req.body.doctorID;

  //first create the identity for the doctor and add to wallet
  let response = await network.registerDoctor(
    doctorID,
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
    let networkObj = await network.connectToNetwork(doctorID, "doctorContract");
    if (networkObj.error) {
      res.statusCode = 500;
      res.send(networkObj.error);
      return;
    }

    let args = [JSON.stringify(req.body)];

    //connect to network and update the state with doctorID
    let invokeResponse = await network.invoke(
      networkObj,
      false,
      "createDoctor",
      args
    );

    if (invokeResponse.error) {
      res.statusCode = 500;
      res.send(invokeResponse.error);
      return;
    } else {
      let parsedResponse = JSON.parse(invokeResponse);
      parsedResponse += ". Use doctorID to login above.";
      res.send(parsedResponse);
    }
  }
});

doctorRouter.route("/login").post(async (req, res) => {
  let networkObj = await network.connectToNetwork(
    req.body.doctorID,
    "doctorContract"
  );
  if (networkObj.error) {
    res.statusCode = 500;
    res.send(networkObj.error);
    return;
  }

  let args = [JSON.stringify(req.body)];
  //connect to network and update the state with doctorID
  let invokeResponse = await network.invoke(
    networkObj,
    true,
    "loginDoctor",
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

module.exports = doctorRouter;
