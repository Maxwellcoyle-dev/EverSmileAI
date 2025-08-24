import googleAuth from "../utilities/google-auth.mjs";

const priorityAgent = async (event) => {
  console.log(event);
  const googleAuthResponse = await googleAuth();
  console.log(googleAuthResponse);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello, World! - from the priorityAgent function",
    }),
  };
};

export default priorityAgent;
