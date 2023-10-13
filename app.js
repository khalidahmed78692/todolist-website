//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://khalidahmed78692:Khalid78692@cluster0.3zjlrpg.mongodb.net/todolistDB"
);

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const coding = new Item({
  name: "Coding",
});

const webDevelopment = new Item({
  name: "Web Development",
});

const coreSubject = new Item({
  name: "Core Subject",
});

const defaultItems = [coding, webDevelopment, coreSubject];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find().then(function (itemsfound) {
    if (itemsfound.length === 0) {
      Item.insertMany(defaultItems).then(function (items) {
        console.log("Successfully inserted documents");
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: itemsfound });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then(function (found) {
      found.items.push(item);
      found.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkeditemid = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkeditemid).then(function (err) {
      if (err) console.log(err);
      else console.log("Successfully deleted item");
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkeditemid } } }
    ).then(function (found) {
      if (found) {
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName })
    .then(function (found) {
      if (found)
        res.render("list", {
          listTitle: found.name,
          newListItems: found.items,
        });
      else {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.render("/" + customListName);
      }
    })
    .catch(function (err) {
      console.log("error occured");
    });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
