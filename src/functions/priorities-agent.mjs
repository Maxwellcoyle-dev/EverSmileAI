const priorityAgent = async (event) => {
  console.log(event);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello, World! - from the priorityAgent function",
    }),
  };
};

export default priorityAgent;
