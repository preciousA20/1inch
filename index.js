const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = 3001;

const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use(express.json());

app.get("/tokenPrice", async (req, res) => {
  const {query} = req 
 // console.log(process.env.MORALIS_KEY)
 const responseOne = await Moralis.EvmApi.token.getTokenPrice({  
  address: query.addressOne
 })

 const responseTwo = await Moralis.EvmApi.token.getTokenPrice({
  address: query.addressTwo 
 })

//console.log(responseOne.raw, responseTwo.raw)
const usdPrice = {
  tokenOne: responseOne.raw.usdPrice,
  tokenTwo: responseTwo.raw.usdPrice,
  ratio: responseOne.raw.usdPrice/responseTwo.raw.usdPrice
}
console.log(usdPrice)
  return res.status(200).json(usdPrice)
})

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls...`);
  });
});

//0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
//0x514910771af9ca656af840dff83e8264ecf986ca

//https://github.com/IAmJaysWay/dexFinal/blob/main/dexFinal/dex/src/components/Swap.js