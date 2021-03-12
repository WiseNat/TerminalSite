const express = require("express");
const path = require("path");

const port = 3000;

const app = express();
app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
    console.log("User connected: " + req.ip.split(":").pop());
});

app.listen(process.env.port || port, function() {
    console.log(`Server listening on http://localhost:${port}`);
});