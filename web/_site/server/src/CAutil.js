"use strict";
/**
 *
 * @param {*} FabricCAServices
 * @param {*} ccp
 */
exports.buildCAClient = (FabricCAServices, ccp, caHostName) => {
  // Create a new CA client for interacting with the CA.
  const caInfo = ccp.certificateAuthorities[caHostName]; //lookup CA details from config
  const caTLSCACerts = caInfo.tlsCACerts.pem;
  const caClient = new FabricCAServices(
    caInfo.url,
    { trustedRoots: caTLSCACerts, verify: false },
    caInfo.caName
  );

  console.log(`Built a CA Client named ${caInfo.caName}`);
  return caClient;
};

exports.registerAndEnrollUser = async (
  caClient,
  wallet,
  orgMSPID,
  userID,
  appAdmin,
  affiliation
) => {
  try {
    // Check to see if we've already enrolled the user
    const userIdentity = await wallet.get(userID);
    if (userIdentity) {
      console.log(
        `An identity for the user ${userID} already exists in the wallet`
      );
      throw new Error("An identity for the user ${userID} already exists in the wallet.");
    }

    // Must use an admin to register a new user
    const adminIdentity = await wallet.get(appAdmin);
    if (!adminIdentity) {
      console.log(
        "An identity for the admin user does not exist in the wallet"
      );
      console.log("Enroll the admin user before retrying");
      throw new Error("An identity for the admin user does not exist in the wallet. Enroll the admin user before retrying.");
    }

    // build a user object for authenticating with the CA
    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, appAdmin);

    // Register the user, enroll the user, and import the new identity into the wallet.
    // if affiliation is specified by client, the affiliation value must be configured in CA
    const secret = await caClient.register(
      {
        affiliation: affiliation,
        enrollmentID: userID,
        role: "client",
      },
      adminUser
		);
		
    const enrollment = await caClient.enroll({
      enrollmentID: userID,
      enrollmentSecret: secret,
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: orgMSPID,
      type: "X.509",
    };
    await wallet.put(userID, x509Identity);
    console.log(
      `Successfully registered and enrolled user ${userID} and imported it into the wallet`
    );
    return `Successfully registered user. Use userID ${userID} to login above.`;
  } catch (error) {
    console.error(`Failed to register user ${userID} due to ${error}`);
    let response = {};
		response.error = error;
    return response;
  }
};
