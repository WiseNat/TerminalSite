const express = require("express");
const path = require("path");
const fs = require("fs");

const port = 8080;
const terminalDir = path.join(__dirname, "public", "terminals");
const dataDir = path.join(__dirname, "public", "data");

const app = express();
app.use(express.static(path.join(__dirname, "public")));

function generateJsonDir(){
    var jsonDir = {};
    fs.readdir(dataDir, (err, files) => {
        files.forEach((el) => {
            var filePath = el.split("-");
            var currentPath = jsonDir;

            filePath.forEach((el, ind, filePath) => {
                // Final element: file name
                if (ind == filePath.length - 1) {
                    if ("files" in currentPath) {
                        currentPath["files"].push(el);
                    } else {
                        currentPath["files"] = [el];
                    }
                }
                // Path
                else {
                    if (!(el in currentPath)) {
                        currentPath[el] = {};
                        currentPath = currentPath[el];
                    } else {
                        currentPath = currentPath[el];
                    }
                }
            });
        });
        jsonDir = JSON.stringify(jsonDir, null, 4);
        fs.writeFile(path.join(__dirname, "public", "json", "dir_structure.json"), jsonDir, "utf8", err => {
            if (err) {
                console.log(err);
            }
        });
    });
}

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
var server = app.listen(process.env.port || port, "0.0.0.0", function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log(`Server listening on at http://${host}:${port}"`);
    generateJsonDir();
});