const express = require("express");
const helmet = require("helmet");
const contentLength = require("express-content-length-validator");
const path = require("path");
const fs = require("fs");
const requestIp = require("request-ip");

const port = 8080;
const terminalDir = path.join(__dirname, "public", "terminals");
const dataDir = path.join(__dirname, "public", "data");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(contentLength.validateMax());
app.use(requestIp.mw());

function generateJsonDir() {
    var dir = "public/json";

    if (!fs.existsSync(dir)) {
        console.log("doesnt exist");
        fs.mkdirSync(dir);
    }

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

// req.ip.split(":").pop()

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
    console.log(`User connected: ${req.clientIp}`);
});

app.get("/terminals", (req, res) => {
    console.log(`Sending file list to ${req.clientIp}`);
    fs.readdir(terminalDir, (err, files) => {
        if (err) {
            console.error(err);
        } else {
            files.forEach((el, ind) => {
                files[ind] = el.replace(".json", "");
            });
            res.json({
                terminals: files
            });
        }
    });
});


// 10.198.96.65:8000
var server = app.listen(process.env.port || port, "0.0.0.0", function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log(`Server listening on at http://${host}:${port}`);
    generateJsonDir();
});