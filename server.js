"use strict";

let express = require("express");
let bodyParser = require("body-parser");
let cors = require("cors");
let helmet = require("helmet");
let mongo = require("mongodb").MongoClient;

let apiRoutes = require("./routes/api.js");
let fccTestingRoutes = require("./routes/fcctesting.js");
let runner = require("./test-runner.js");

process.env.DATABASE =
  "mongodb+srv://dbMahmoud:asdf3456@cluster0-tpj5i.mongodb.net/test?retryWrites=true&w=majority";

let app = express();
app.use(helmet());

// Testing (For FCC testing purposes only):
app.use(cors({ origin: "*" }));
process.env.NODE_ENV = "test";

// This project needs to parse POST bodies:
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CSS/HTML (Index page, static HTML/CSS):
app.use(express.static("public"));
app.route("/").get((req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

//Sample front-end
app.route("/:project/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/issue.html");
});

// For FCC testing purposes
fccTestingRoutes(app);

mongo
  .connect(process.env.DATABASE)
  .then((client) => {
    var db = client.db("dbMahmoud");

    // Routing for API
    apiRoutes(app, db);

    // Not found middleware:
    app.use((req, res, next) => {
      return next({ status: 404, message: "not found" });
    });

    // Start our server and tests!
    const listener = app.listen(3000 || process.env.PORT, () => {
      console.log("Your app is listening on port " + listener.address().port);
      if (process.env.NODE_ENV === "test") {
        console.log("Running Tests...");
        setTimeout(function () {
          try {
            runner.run();
          } catch (error) {
            console.log("Tests are not valid:");
            console.log(error);
          }
        }, 1500);
      }
    });
  })
  .catch((err) => console.log(err));

module.exports = app; //for testing
