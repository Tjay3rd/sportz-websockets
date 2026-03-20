import express from "express";

const app = express();

app.use(express.json());
const port = 8080;

app.get("/", (req,res) => res.send("Helo from Express"))



app.listen(port, ()=> console.log(`Listening on port ${port}`))


