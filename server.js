const express = require("express");
const path = require("path");
const fs = require("fs");

const port = 8000;
const terminalDir = path.join(__dirname, "public", "terminals");

const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
    console.log("User connected: " + req.ip.split(":").pop());
});

app.get("/terminals", (req, res) => {
    console.log("Sending file list to " + req.ip.split(":").pop());
    fs.readdir(terminalDir, (err, files) => {
        if (err) {
            console.error(err);
        } else {
            files.forEach((el, ind) => { files[ind] = el.replace(".json", ""); });
            res.json({terminals: files});
        }
    });
});


// 10.198.96.65:8000
app.listen(process.env.port || port, "0.0.0.0", function() {
    console.log(`Server listening on http://localhost:${port}`);
});