"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");

const index = require("./routes/index");
const patientRouter = require('./routes/patientRouter');
const doctorRouter = require('./routes/doctorRouter')

const app = express();
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use("/", index);
app.use("/patient", patientRouter)
app.use("/doctor", doctorRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(process.env.PORT || 8081);

// //get all assets in world state
// app.get("/queryAll", async (req, res) => {
//   let networkObj = await network.connectToNetwork(appAdmin, "queryContract");
//   let response = await network.invoke(networkObj, true, "querow myAll", "");
//   let parsedResponse = await JSON.parse(response);
//   res.send(parsedResponse);
// });