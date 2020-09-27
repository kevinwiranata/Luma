"use strict";
const { Wallets, Gateway } = require("fabric-network");
const path = require("path");
const util = require("util");
const fs = require("fs");
const FabricCAServices = require("fabric-ca-client");

let CAutil = require("./CAutil.js");

//connect to the config file
const configPath = path.join(process.cwd(), "./config.json");
const configJSON = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(configJSON);
let connection_file = config.connection_file;
let gatewayDiscovery = config.gatewayDiscovery;
let appAdmin = config.appAdmin;
let orgMSPID = config.orgMSPID;

// connect to the connection file
const ccpPath = path.join(process.cwd(), connection_file);
const ccpJSON = fs.readFileSync(ccpPath, "utf8");
const ccp = JSON.parse(ccpJSON);

// creates a network object (contract, network, gateway) to invoke transactions
exports.connectToNetwork = async function (userName, smartContract) {
  const gateway = new Gateway();

  try {
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);
    console.log("userName: ");
    console.log(userName);

    console.log("wallet: ");
    console.log(util.inspect(wallet));

    const userExists = await wallet.get(userName);
    if (!userExists) {
      console.log(
        "An identity for the user " + userName + " does not exist in the wallet"
      );
      console.log("Run the registerUser.js application before retrying");
      let response = {};
      response.error =
        "An identity for the user " +
        userName +
        " does not exist in the wallet. Register " +
        userName +
        " first";
      return response;
    }

    await gateway.connect(ccp, {
      wallet: wallet,
      identity: userName,
      discovery: gatewayDiscovery,
    });

    // Connect to our local fabric
    const network = await gateway.getNetwork("chanel1");
    console.log("Connected to mychannel. ");
    // Get the contract we have installed on the peer
    const contract = await network.getContract(smartContract);

    let networkObj = {
      contract: contract,
      network: network,
      gateway: gateway,
    };

    return networkObj;
  } catch (error) {
    console.log(`Error processing transaction. ${error}`);
    console.log(error.stack);
    let response = {};
    response.error = error;
    console.log("Done connecting to network.");
    gateway.disconnect();
    return response;
  }
};

exports.invoke = async function (networkObj, isQuery, func, args) {
  try {
    console.log("inside invoke");
    console.log(`isQuery: ${isQuery}, func: ${func}, args: ${args}`);

    if (isQuery === true) {
      // query, transaction is not recorded on ledger
      if (args) {
        console.log("inside isQuery, args");
        console.log(args);
        let response = await networkObj.contract.evaluateTransaction(
          func,
          args
        );
        console.log(response);
        console.log(`Transaction ${func} with args ${args} has been evaluated`);

        await networkObj.gateway.disconnect();

        return response;
      } else {
        let response = await networkObj.contract.evaluateTransaction(func);
        console.log(response);
        console.log(`Transaction ${func} without args has been evaluated`);

        await networkObj.gateway.disconnect();

        return response;
      }
    } else {
      // notQuery, transaction is record on ledger
      if (args) {
        console.log("notQuery, args");
        console.log(args);
        console.log(func);

        args = JSON.parse(args[0]);
        args = JSON.stringify(args);

        console.log(util.inspect(args));
        console.log("before submit");
        console.log(util.inspect(networkObj));
        let response = await networkObj.contract.submitTransaction(func, args);
        console.log("after submit");

        console.log(response);
        console.log(`Transaction ${func} with args ${args} has been submitted`);

        await networkObj.gateway.disconnect();

        return response;
      } else {
        let response = await networkObj.contract.submitTransaction(func);
        console.log(response);
        console.log(`Transaction ${func} with args has been submitted`);
        await networkObj.gateway.disconnect();

        return response;
      }
    }
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    let response = {};
    response.error = error;
    return response;
  }
};

exports.registerPatient = async function (patientID, password, fullName) {
  console.log("patientID");
  console.log(patientID);

  if (!patientID || !password || !fullName) {
    return {
      error: "Error! You need to fill all fields before you can register!",
    };
  }

  try {
    // Create a new file system based wallet for managing identities
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(wallet);

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet: wallet,
      identity: appAdmin,
      discovery: gatewayDiscovery,
    });

    // Get the CA client object from the gateway for interacting with the CA.
    const caClient = CAutil.buildCAClient(
      FabricCAServices,
      ccp,
      "169.51.204.160:31872"
    );
    const response = await CAutil.registerAndEnrollUser(
      caClient,
      wallet,
      orgMSPID,
      patientID,
      appAdmin,
      ""
    );
    return response;
  } catch (error) {
    let response = {};
    response.error = error;
    return response;
  }
};

exports.registerDoctor = async function (doctorID, password, fullName) {
  console.log("doctorID ");
  console.log(doctorID);

  if (!doctorID || !password || !fullName) {
    return {
      error: "Error! You need to fill all fields before you can register!",
    };
  }

  try {
    // Create a new file system based wallet for managing identities
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(wallet);

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet: wallet,
      identity: appAdmin,
      discovery: gatewayDiscovery,
    });

    // Get the CA client object from the gateway for interacting with the CA.
    const caClient = CAutil.buildCAClient(
      FabricCAServices,
      ccp,
      "169.51.204.160:31872"
    );

    return await CAutil.registerAndEnrollUser(
      caClient,
      wallet,
      orgMSPID,
      doctorID,
      ""
    );
  } catch (error) {
    let response = {};
    response.error = error;
    return response;
  }
};
