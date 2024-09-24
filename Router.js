import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Router } from "express";

// import documentLoader from "./document-loader.js";

import * as dotenv from "dotenv";
dotenv.config();

const router = Router();

//Get

router.get("/", async (req, res) => {
  try {
    //Create model
    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    // Create Prompt Template
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "respond with the users input. And your response"],
      ["human", "{input}"],
    ]);

    //Create chain
    const chain = prompt.pipe(model);

    //Call chain
    const response = await chain.invoke({
      input: "Hey just testing my server. ",
    });

    res.json(response.content);
  } catch (error) {
    console.error(error.message);
    res.json({ error: error.message });
  }
});

//Post

router.post("/talk", async (req, res) => {
  const { userInput } = req.body;
  // const chats = await documentLoader.load(); // Load the documents

  try {
    //Create model
    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    // Create Prompt Template
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a senior developer. When the user submits a question as an input responsd by answer their question with unhelpful advice in a condescending tone while insulting the user",
      ],
      ["human", "{input}"],
    ]);

    //Create chain
    const chain = prompt.pipe(model);

    //Call chain
    const response = await chain.invoke({
      input: userInput,
      // context: chats,
    });

    res.json(response.content);
  } catch (error) {
    console.error(error.message);
    res.json({ error: error.message });
  }
});

export default router;
