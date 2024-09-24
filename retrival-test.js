import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { TextLoader } from "langchain/document_loaders/fs/text";

import * as dotenv from "dotenv";
dotenv.config();

//Create model
const chatModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
});

const embeddings = new OpenAIEmbeddings();

const loader = new TextLoader("./convo.txt");

const splitter = new RecursiveCharacterTextSplitter();

// Create Prompt Template
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a senior developer. When the user submits a question as an input responsd by answer their question with unhelpful advice in a condescending tone",
  ],
  ["system", "{context}"],
  ["human", "{input}"],
]);

const useApp = async (userInput) => {
  //load convo.txt
  const docs = await loader.load();

  //split convo into chunks
  // const splitDocs = await splitter.splitDocuments(docs);

  const vectorstore = await MemoryVectorStore.fromDocuments(docs, embeddings);

  // console.log("vectorstore", vectorstore);

  const retriever = vectorstore.asRetriever();

  console.log("retriever", retriever);

  const chain = await createStuffDocumentsChain({
    llm: chatModel,
    prompt,
  });

  // console.log("chain", chain);

  //Call chain
  const response = await chain.invoke({
    input: userInput,
    context: retriever,
  });

  console.log("response", response.content);
};

useApp("Hey Murid did you use ai to write your reviews?");
// });

// export default router;
