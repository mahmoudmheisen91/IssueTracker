"use strict";

let expect = require("chai").expect;
let mongo = require("mongodb").MongoClient;
let ObjectId = require("mongodb").ObjectID;

module.exports = function (app, db) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      var project = req.params.project;
    })

    .post(function (req, res) {
      let project = req.params.project;
      let issue = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || "",
        created_on: new Date(),
        updated_on: new Date(),
        open: true,
      };

      let error = "Missing Data";
      if (!issue.issue_title || !issue.issue_text || !issue.created_by) {
        res.send(error);
        res.end();
      } else {
        db.collection(project).insertOne(issue, (err, doc) => {
          if (err) {
            res.redirect("/");
          } else {
            issue._id = doc.insertedId;
            res.json(issue);
            res.end();
          }
        });
      }
    })

    .put(function (req, res) {
      var project = req.params.project;
    })

    .delete(function (req, res) {
      var project = req.params.project;
    });
};
