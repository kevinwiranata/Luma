"use strict";

const fs = require("fs");
const path = require("path");
const FabricCAServices = require("fabric-ca-client");
const { Wallets } = require("fabric-network");

// capture network variables from config.json
const configPath = path.join(process.cwd(), "./config.json");
const configJSON = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(configJSON);

// let connection_file = config.connection_file;
let appAdmin = config.appAdmin;
let appAdminSecret = config.appAdminSecret;
let orgMSPID = config.orgMSPID;
let caName = config.caName;

async function main() {
  try {
    // Create a new CA client for interacting with the CA.
    const caURL = caName;
    const caClient = new FabricCAServices(caURL);

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check to see if we've already enrolled the admin user.
    const adminExists = await wallet.get(appAdmin);
    if (adminExists) {
      console.log(
        "An identity for the admin user already exists in the wallet"
      );
      return;
    }
    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await caClient.enroll({
      enrollmentID: appAdmin,
      enrollmentSecret: appAdminSecret,
		});
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: orgMSPID,
      type: "X.509",
    };
    await wallet.put(appAdmin, x509Identity);
    console.log(
      "Successfully enrolled admin user" +
        appAdmin +
        "and imported it into the wallet"
    );
  } catch (error) {
    console.error(`Failed to enroll admin user' ${appAdmin},  ${error}`);
    process.exit(1);
  }
}

main();
