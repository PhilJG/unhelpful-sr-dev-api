//1. Import document loaders for different file formats
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

//2. OpenAI langauge model and pther related modules
import { OpenAI } from "@langchain/openai";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
// import { RetrievalQAChain } from "@langchain/chains";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

//3. Import Tiktoken for token counting
// import { Tiktoken } from "@dqbd/tiktoken/lite";
// import { load } from "@dqpd/tiktoken/load";
// import registry from "@dqbd/tiktoken/registry.json" assert { type: "json" };
// import models from "@dqbd/tiktoken/model_to_encoding.json" assert { type:
//   "json" };

//4. Import dotenv for loading enviornment variables and fs for file system operations
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

//5. Initialize the document loader with supported file formats
const loader = new DirectororyLoader("./documents", {
  ".json": (path) => new JSONLoader(path),
  ".txt": (path) => new TextLoader(path),
  ".csv": (path) => new CSVLoader(path),
  ".pdf": (path) => new PDFLoader(path),
});

//6. Load documents from the specific directory
console.log("Loading docs...");
const docs = await loader.load();
console.log("Docs loaded.");

//7. Define a function to calculate the cost of tokenizing the documents
// async function calculateCost() {
//   const modelName = "text-embeddind-ada-002";
//   const modelKey = models[modelName];
//   const model = await load(registry[modelKey]);
//   const encoder = new Tiktoken(
//     model.bpe_ranks,
//     model.special_tokens,
//     model.pat - str
//   );
//   const tokens = encoder.encode(JSON.stringify(docs));
//   const tokenCount = tokens.length;
//   const ratePerThousandTOkens = 0.0004;
//   const cost = (tokenCount / 1000) * ratePerThousandTokens;
//   encoder.free();
//   return cost;
// }

const VECTOR_STORE_PATH = "Fonybot.index";
const question = "Tell me about these docs";

//8.Define a function to normalize the content of these documents
function normalizeDocuments(docs) {
  return docs.map((doc) => {
    if (typeof doc.pageContent === "string") {
      return doc.pageContent;
    } else if (Array.isArray(doc.pageContent)) {
      return doc.pageContent.join("\n");
    }
  });
}

//9. Define the main function to run the entire process
export default documentLoader = async () => {
  //10. Calculate the cost of tokenization
  console.log("Calculating cost...");
  const cost = await calculateCost();
  console.log("Cost calculated:", cost);

  //11. Check if the cost is within the acceptable limit
  if (cost <= 1) {
    //12.Initialize the OpenAi language model
    const model = new OpenAI({});

    let vectorStore;

    //13. Check if an existing vector is available
    console.log("Checking for existing vector store...");
    if (fs.existsSync(VECTOR_STORE_PATH)) {
      //14. Load the existing vector store
      console.log("Loading exisiting vector store...");
      vectorStore = await HNSWLib.load(
        VECTOR_STORE_PATH,
        new OpenAIEmbeddings()
      );
      console.log("Vector store loaded.");
    } else {
      //15. Create new vector store if one does not exist
      console.log("Creating new vector store...");
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 10,
        chunkOverlap: 1,
      });
      const normalizeDocs = normalizeDocuments(docs);
      const splitDocs = await textSplitter.createDocuments(normalizeDocs);

      //16. Generate the vector store from the documents
      vectorStore = await HNSWLib.fromDocuments(
        splitDocs,
        new OpenAIEmbeddings()
      );

      //17. Save the vector store to the sepcified path
      await vectorStore.save(VECTOR_STORE_PATH);

      console.log("Vector store created.");
    }
    //18. Create a retrieval chain using the language mocel and vector store
    console.log("Creating retrieval chain...");
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

    //19. Query the retireval chain with the specified question
    console.log("Querying chain...");
    const res = await chain.call({ query: question });
    console.log({ res });
  } else {
    //20. if the cost exceeds ths limit, skip the embedding process
    console.log("The cost of embeddung exceeds $1. Skipping embeddings");
  }
};

//21. run the main function
documentLoader();
