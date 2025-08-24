import googleAuth from "../utilities/google-auth.mjs";

const priorityAgent = async (event) => {
  console.log(event);

  try {
    const googleAuthResponse = await googleAuth();
    console.log("Google Auth Response:", googleAuthResponse);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Success! AWS STS validation completed",
        awsIdentity: googleAuthResponse.awsIdentity,
        drives: googleAuthResponse.drives,
        sampleFiles: googleAuthResponse.sampleFiles,
        event: event,
      }),
    };
  } catch (error) {
    console.error("Error in priorityAgent:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error occurred",
        error: error.message,
        event: event,
      }),
    };
  }
};

export default priorityAgent;
