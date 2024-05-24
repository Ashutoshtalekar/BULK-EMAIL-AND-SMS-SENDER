//jshint esversion:6
const mongoose = require("mongoose"); //backend for mongodb
const express = require("express");
const bodyParser = require("body-parser");
const encrypt = require("mongoose-encryption");
const ejs = require("ejs");
const _ = require("lodash");
let alert = require("alert");
const { exec } = require("child_process");

const CSVToJSON = require("csvtojson");
require("dotenv").config();

// const sid = process.env.TWILIO_ACCOUNT_SID;
const sid = "AC4818444fcf353850ab8b0f6edcfa90cb";
const api = process.env.API_KEY;
// const auth = process.env.TWILIO_AUTH_TOKEN;
const auth = "3ba0f9e09d4abb81538a745a5c0dd95d";
const b = process.env.binary;
const twilio_number = process.env.TWILIO_NUMBER;
const client = require("twilio")(sid, auth);
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const sms = require("fast-two-sms");
const {
  VerificationCheckInstance,
} = require("twilio/lib/rest/verify/v2/service/verificationCheck");
const { forEach } = require("lodash");

const fs = require("fs");
const data = [];

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  age: Number,
  address: String,
  state: String,
  username: String,
  password: String,
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const logSchema = new mongoose.Schema({
  sent: String,
  status: String,
  curr_date: String,
});

const secret = "manthisispain";
const User = mongoose.model("User", userSchema);
const Admin = mongoose.model("Admin", adminSchema);
const Log = mongoose.model("Log", logSchema);

app.set("view engine", "ejs");
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/hackathonDB");

var logged = 0;
const { readFileSync, promises: fsPromises } = require("fs");

function alerting() {
  alert("This is an alert dialog box");
}

function writeTOFile(server, pin) {
  let dContinue = confirm(
    "You are uploading a file . Do you want to continue?"
  );
  if (dContinue) {
    console.log("do something");
  } else {
    console.log("do another thing");
  }
}
// 👇️ if using ES6 Imports uncomment line below
// import {readFileSync, promises as fsPromises} from 'fs';

// ✅ read file ASYNCHRONOUSLY
async function asyncReadFile(filename) {
  try {
    const contents = await fsPromises.readFile(filename, "utf-8");

    const arr = contents.split(/\r\n/);

    console.log(arr); // 👉️ ['One', 'Two', 'Three', 'Four']

    return arr;
  } catch (err) {
    console.log(err);
  }
}

function alphaOnly(event) {
  console.log("n");
  alert(event);

  var key;

  if (window.event) {
    key = window.event.key;
  } else if (e) {
    key = e.which;
  }
  //var key = window.event.key || event.key;
  alert(key.value);
  return ((key >= 65 && key <= 90) || (key >= 95 && key <= 122));

}

app.get("/", function (req, res) {
  res.render("login");
});

app.get("/registration", function (req, res) {
  res.render("registration");
});

app.get("/verify", function (req, res) {
  res.render("verify");
});

app.post("/verify", function (req, res) {
  client.verify.v2
    .services("VAd455c241118f7c74c501b8a8027d64af")
    .verifications.create({ to: "+91" + req.body.phonenumber, channel: "sms" })
    .then((verification) => console.log(verification.status));

  res.render("verifycode");
});

app.get("/verifycode", function (req, res) {
  console.log(number);
  res.render("verifycode");
});

app.post("/vih", function (req, res) {
  client.verify.v2
    .services("VAd455c241118f7c74c501b8a8027d64af")
    .verificationChecks.create({
      to: "+91" + req.body.phonenumber,
      code: req.body.verificationcode,
    })
    .then((verification_check) => console.log(verification_check.status));

  res.render("success_registration");
});

app.get("/emails", function (req, res) {
  if (logged) {
    res.render("emails");
  }
});

app.get("/home", function (req, res) {
  res.render("home");
});

app.get("/messaging", function (req, res) {
  if (logged) {
    res.render("messaging");
  }
});

app.get("/admin", function (req, res) {
  res.render("adminlogin");
});

app.get("/logs", function (req, res) {
  Log.find({}, function (err, foundItems) {
    res.render("logs", { logItems: foundItems });
  });
});

app.get("/state-messaging", function (req, res) {
  res.render("state-messaging");
});

app.post("/admin", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  console.log(req.body);
  Admin.findOne({ username: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        console.log(foundUser);
        if (foundUser.password === password) {
          logged = 1;
          res.render("mediator");
        }
      }
    }
  });
});

app.post("/", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  console.log(req.body);
  User.findOne({ username: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        console.log(foundUser);
        if (foundUser.password === password) {
          logged = 1;
          res.render("success_registration");
        }
      }
    }
  });
});

app.post("/state-messaging", function (req, res) {
  let state = req.body.state;
  let message = req.body.message;
  var currentdate = new Date();
  var datetime =
    currentdate.getDate() +
    "/" +
    (currentdate.getMonth() + 1) +
    "/" +
    currentdate.getFullYear() +
    " @ " +
    currentdate.getHours() +
    ":" +
    currentdate.getMinutes() +
    ":" +
    currentdate.getSeconds();
  User.find({ state: state }, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      doc.forEach((user) => {
        client.messages
          .create({
            body: message,
            from: "+16626667521",
            to: "+91" + user.phone,
          })
          .then((message) => {
            console.log("entering");
            const log = new Log({
              sent: doc.phone,
              status: "success",
              curr_date: datetime,
            });
            log.save();
            console.log("leaving");
          });
      });
    }
  });
});

app.get("/agefilter", function (req, res) {
  res.render("age");
});

app.post("/agefilter", function (req, res) {
  let message = req.body.message;

  let low = req.body.number[0];
  let high = req.body.number[1];
  var currentdate = new Date();
  var datetime =
    currentdate.getDate() +
    "/" +
    (currentdate.getMonth() + 1) +
    "/" +
    currentdate.getFullYear() +
    " @ " +
    currentdate.getHours() +
    ":" +
    currentdate.getMinutes() +
    ":" +
    currentdate.getSeconds();
  User.find({}, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      doc.forEach((user) => {
        if (user.age >= low && user.age <= high) {
          client.messages
            .create({
              body: message,
              from: "+16626667521",
              to: "+91" + user.phone,
            })
            .then((message) => {
              console.log("entering");
              const log = new Log({
                sent: doc.phone,
                status: "success",
                curr_date: datetime,
              });
              log.save();
              console.log("leaving");
            });
        }
      });
    }
  });
});

app.post("/messaging", function (req, res) {
  let file = req.body.file;
  let number = req.body.number;
  let message = req.body.message;
  let send_all = req.body.sendAllCheck;
  let filtercheck = req.body.filtercheck;
  var currentdate = new Date();
  var datetime =
    currentdate.getDate() +
    "/" +
    (currentdate.getMonth() + 1) +
    "/" +
    currentdate.getFullYear() +
    " @ " +
    currentdate.getHours() +
    ":" +
    currentdate.getMinutes() +
    ":" +
    currentdate.getSeconds();

  if (file === "") {
  } else {
    CSVToJSON()
      .fromFile("users.csv")
      .then((users) => {
        // users is a JSON array
        // log the JSON array
        users.forEach((user) => {
          console.log(user);
          client.messages
            .create({
              body: message,
              from: "+16626667521",
              to: "+91" + user.phone,
            })
            .then((message) => {
              console.log("entering");
              const log = new Log({
                sent: number,
                status: "success",
                curr_date: datetime,
              });
              log.save();
              console.log("leaving");
            });
        });
      })
      .catch((err) => {
        // log error if any
        console.log(err);
      });
  }

  if (!send_all) {
    client.messages
      .create({
        body: message,
        from: "+16626667521",
        to: "+91" + number,
      })
      .then((message) => {
        console.log("entering");
        const log = new Log({
          sent: number,
          status: "success",
          curr_date: datetime,
        });
        log.save();
        console.log("leaving");
      });
  } else {
    if (filtercheck) {
      res.render("filter");
    } else {
      User.find({}, function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          doc.forEach((user) => {
            client.messages
              .create({
                body: message,
                from: "+16626667521",
                to: "+91" + user.phone,
              })
              .then((message) => {
                console.log("entering");
                const log = new Log({
                  sent: doc.phone,
                  status: "success",
                  curr_date: datetime,
                });
                log.save();
                console.log("leaving");
              });
          });
        }
      });
    }
    res.render("messaging");
  }
});


app.get("/addnewadmin", function (req, res) {
  res.render("newadmin");
})

app.post("/addnewadmin", function (req, res) {
  
  const username = req.body.username;
  const password = req.body.password;

  const admin = new Admin({
    
    username: username,
    password: password
  })

  admin.save(function (err) {
    if (!err) {
      res.render("adminlogin");
    }
  })
})

app.post("/registration", function (req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const address = req.body.address;
  const state = req.body.state;

  const user = new User({
    name: name,
    email: email,
    username: username,
    phone: req.body.number[1],
    age: req.body.number[0],
    address: address,
    state: state,
    password: password,
  });

  user.save(function (err) {
    if (!err) {
      res.render("verify");
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = "3000";
}

app.listen(port, function () {
  console.log("Server has started sucessfully");
});
