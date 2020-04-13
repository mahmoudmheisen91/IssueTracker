"use strict";

let expect = require("chai").expect;
let mongo = require("mongodb").MongoClient;
let ObjectId = require("mongodb").ObjectID;

module.exports = function (app, db) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;

      let issue = req.query;
      if (issue._id) {
        issue._id = new ObjectId(issue._id);
      }

      db.collection(project)
        .find(issue)
        .toArray((err, doc) => {
          if (err) {
            res.redirect("/");
          } else {
            res.json(doc);
            res.end();
          }
        });
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
        res.status(404).type("text").send(error);
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
      let project = req.params.project;
      let _id = req.body._id;
      let issue = {
        issue_title: req.body.issue_title || "",
        issue_text: req.body.issue_text || "",
        created_by: req.body.created_by || "",
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || "",
        open: req.body.open || false,
      };

      for (let item in issue) {
        if (issue[item] === "" || issue[item] === false) {
          delete issue[item];
        }
      }

      let error = "no updated field sent";
      if (!Object.keys(issue).length) {
        res.send(error);
        res.end();
      } else {
        issue.updated_on = new Date();
        let new_issue = { _id: new ObjectId(_id) };
        db.collection(project).findAndModify(
          new_issue,
          [["_id", 1]],
          { $set: issue },
          { new: true },
          (err, doc) => {
            if (err) {
              res
                .status(400)
                .type("text")
                .send("could not update " + _id);
              res.end();
            } else {
              res.send("successfully updated");
              res.end();
            }
          }
        );
      }
    })

    .delete(function (req, res) {
      let project = req.params.project;
      let _id = req.body._id;

      if (!_id) {
        res.status(404).type("text").send("id error");
        res.end();
      } else {
        let issue = { _id: new ObjectId(_id) };
        db.collection(project).findOneAndDelete(issue, (err, doc) => {
          if (err) {
            res
              .status(400)
              .type("text")
              .send("could not delete " + _id);
            res.end();
          } else {
            res.send("deleted " + _id);
            res.end();
          }
        });
      }
    });
};
