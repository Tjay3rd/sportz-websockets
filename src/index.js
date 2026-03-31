import express from "express";
import {matchRouter} from "./routes/matches.js";

const app = express();

app.use(express.json());
app.use("/matches", matchRouter)




const port = 8080;

app.listen(port, ()=> console.log(`Listening on port ${port}`))


