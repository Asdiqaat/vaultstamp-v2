// // src/GPTWidget.jsx
// import React, { useState } from "react";
// import { getGPTResponse } from "./gptWrappers";

// const GPTWidget = () => {
//   const [input, setInput] = useState("");
//   const [response, setResponse] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!input) return;

//     setLoading(true);
//     const aiResponse = await getGPTResponse(input);
//     setResponse(aiResponse);
//     setLoading(false);
//   };

// }
