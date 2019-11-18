const express = require("express");
var bodyParser = require("body-parser");
const server = express();
const Nexmo = require("nexmo");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const secrets = require("../../config/secrets.js");
// path.join(__dirname, "private.key");
const nexmo = new Nexmo({
    apiKey: "2910d4dd",
    apiSecret: "rT5pgwc8WJhnIZX8",
    applicationId: "cd3e608e-0cf6-46e0-ae35-822f1ad2b93c",
    privateKey: path.join(__dirname, "./jwtRS256.key")
});

server.use(cors());
const smsModel = require("../smsAuth/authSMS-model.js");
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.get("/", (req, res) => {
    return res.send("GET HTTP method on user resource");
});
server.post("/users", (req, res) => {
    return res.send("POST HTTP method on user resource");
});
server.post("/send_verify_code", (req, res) => {
    var { phone_number } = req.body;

    if (phone_number) {
        smsModel.insert({ phone_number })
            .then(auth => {
                token = generateToken(auth);
                res.status(201).json({ auth, token });
            })
            .catch(err => {
                console.log(err);
                res
                    .status(500)
                    .json({ error: "Could not register user, try again", err });
            });
    } else {
        res
            .status(400)
            .json({ message: "Must provide Phone Number" });
    }


    var phone_number = req.body.callingCode + req.body.phoneNumber;
    console.log("27", phone_number);

    nexmo.verify.request(
        {
            number: phone_number,
            brand: "Chat app"
        },

        (err, result) => {
            console.log("34", err, result);
            if (err) {
                return res.status(500).json({ error: err });
            } else {
                let verifyRequestId = result.request_id;
                console.log(verifyRequestId);
                return res.send(verifyRequestId);
            }
        }
    );


});

function generateToken(auth) {
    const payload = {
        phone_number: auth.phone_number
    };
    const options = {
        expiresIn: "30d"
    };
    return jwt.sign(payload, secrets.environment, options);
}


server.post("/inbound-message", (req, res) => {
    console.log("inbound-message", req.body);
    res.status(200).end();
});
server.post("/message-status", (req, res) => {
    console.log("message-status", req.body);
    res.status(200).end();
});
server.get("/ccc", () => {
    const message = {
        content: {
            type: "text",
            text: "Welcome to Chat App"
        }
    };
    nexmo.channel.send(
        { type: "sms", number: "660844848584" },
        { type: "sms", number: "660844848584" },
        {
            content: {
                type: "text",
                text: "This is an SMS sent from the Messages API"
            }
        },
        (err, data) => {
            console.log(err);
        }
    );
});

server.put("/check_verify_code", (req, res) => {
    //   console.log(req.body);
    let phone_number = req.body.callingCode + req.body.phoneNumber;
    let verifyRequestId = req.body.verfication_id;
    let code = req.body.code;
    console.log(phone_number);
    nexmo.verify.check(
        {
            request_id: verifyRequestId,
            code: code
        },
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err });
            } else {
                const message = {
                    content: {
                        type: "text",
                        text: "Welcome to Chat App"
                    }
                };
                nexmo.channel.send(
                    { type: "sms", number: phone_number },
                    { type: "sms", number: "Chat App" },
                    message,
                    (err, data) => {
                        console.log("85", err);
                    },
                    { useBasicAuth: true }
                );
                return res.send(result);
            }
        }
    );
});

module.exports = server;
