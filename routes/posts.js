var express = require("express");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
const { sanitizeBody } = require("express-validator");

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

var MongoClient = require("mongodb").MongoClient;
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

var url =
  "mongodb+srv://Lauri:Lauri@laurindatabase-ynk4s.azure.mongodb.net/database?retryWrites=true&w=majority";

mongoose
  .connect(url, { useNewUrlParser: true })
  .then(() => console.log("Connection Successful"))
  .catch(err => console.log(err));

mongoose.connection
  .once("open", function() {
    console.log("Connection made!");
  })
  .on("error", function(error) {
    console.log("Not good :(", error);
  });

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

var postSchema = new mongoose.Schema({
  postId: String,
  personLoggedIn: String,
  personPost: String,
  date: String
});

var commentSchema = new mongoose.Schema({
  commentedPost: String,
  commentor: String,
  commentsForPost: String,
  date: String
});

var userSchema = new mongoose.Schema({
  username: String,
  password: String
});

var postIdTrackerSchema = new mongoose.Schema({
  name: String,
  id: Number
});

var requestIdTrackerSchema = new mongoose.Schema({
  name: String,
  id: Number
});

var friendSchema = new mongoose.Schema({
  name: String,
  friendWith: String
});

var requestFriendSchema = new mongoose.Schema({
  requestId: String,
  asker: String,
  target: String
});

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

var postaus = mongoose.model("Post", postSchema);
var kommentti = mongoose.model("Comment", commentSchema);
var kayttaja = mongoose.model("User", userSchema);
var postTracker = mongoose.model("Id", postIdTrackerSchema);
var requestTracker = mongoose.model("rId", requestIdTrackerSchema);
var kaveri = mongoose.model("Friend", friendSchema);
var pyynto = mongoose.model("Request", requestFriendSchema);

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

router.post("/acceptRequest/:requestID/:friendName", function(req, res, next) {
  var kaveri1 = kaveri({
    name: userName,
    friendWith: req.params.friendName
  }).save(function(err) {
    if (err) throw err;
  });

  var kaveri1 = kaveri({
    name: req.params.friendName,
    friendWith: userName
  }).save(function(err) {
    if (err) throw err;
  });

  pyynto.find({}, function(err, postID) {
    if (err) throw err;
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("database");
      var deletethis = req.params.requestID;

      dbo
        .collection("requests")
        .deleteOne({ requestId: req.params.requestID }, function(err, obj) {
          if (err) throw err;
          console.log(obj);
        });
    });
  });
  postaus.find({}, function(err, data3) {
    if (err) throw err;
    kommentti.find({}, function(err, data4) {
      if (err) throw err;
      pyynto.find({}, function(err, data5) {
        if (err) throw err;
        kaveri.find({}, function(err, data8) {
          if (err) throw err;
          res.render("mypage", {
            title: userName,
            post_list: data3,
            comment_list: data4,
            user_list: data5,
            friend_list: data8
          });
        });
      });
    });
  });
});

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

router.post("/addFriend", function(req, res, next) {
  var counter = 0;
  kaveri.find({}, function(err, data) {
    if (err) throw err;
    kayttaja.find({}, function(err, data2) {
      if (err) throw err;
      postaus.find({}, function(err, data3) {
        if (err) throw err;
        kommentti.find({}, function(err, data4) {
          if (err) throw err;
          pyynto.find({}, function(err, data5) {
            if (err) throw err;
            var local_name = req.body.content;

            for (var j = 0; j < data2.length; j++) {
              if (data2[j].username === local_name) {
                counter = counter + 1;
                for (var i = 0; i < data.length; i++) {
                  if (
                    data[i].name === userName &&
                    data[i].friendWith === local_name
                  ) {
                    counter = counter + 1;
                  }
                }
              }
            }

            if (counter === 0) {
              var msg = "*" + local_name + " is not user of Naamakirja";
              res.render("mypage", {
                title: userName,
                post_list: data3,
                comment_list: data4,
                user_list: data5,
                message_f: msg,
                friend_list: data,
                peukku: "no"
              });
            }

            if (counter === 1) {
              requestTracker.find({}, function(err, data6) {
                if (err) throw err;
                var pyynto1 = pyynto({
                  requestId: data6[0].id,
                  asker: userName,
                  target: local_name
                }).save(function(err) {
                  if (err) throw err;
                  updateRequestId();
                  console.log("Request sent!");
                });
              });

              var msg = "*Friend request to " + local_name + " sent";
              res.render("mypage", {
                title: userName,
                post_list: data3,
                comment_list: data4,
                user_list: data5,
                message_f: msg,
                friend_list: data,
                peukku: "yes"
              });
            } else {
              var msg = "*" + local_name + " is already your friend";
              res.render("mypage", {
                title: userName,
                post_list: data3,
                comment_list: data4,
                user_list: data5,
                message_f: msg,
                friend_list: data,
                peukku: "no"
              });
            }
          });
        });
      });
    });
  });
});

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

router.get("/", function(req, res, next) {
  postaus.find({}, function(err, data) {
    if (err) throw err;
    kommentti.find({}, function(err, data2) {
      if (err) throw err;
      kayttaja.find({}, function(err, data3) {
        if (err) throw err;
        kaveri.find({}, function(err, data8) {
          if (err) throw err;
          res.render("posts", {
            title: userName,
            post_list: data,
            comment_list: data2,
            user_list: data3,
            friend_list: data8
          });
        });
      });
    });
  });
});

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

router.post("/filter/:page", function(req, res, next) {
  postaus.find({}, function(err, data) {
    if (err) throw err;
    kommentti.find({}, function(err, data2) {
      if (err) throw err;
      var local_name = req.body.personName;
      console.log("Postaukset: " + local_name);
      var counter = 0;
      kaveri.find({}, function(err, data8) {
        if (err) throw err;
        for (var i = 0; i < data8.length; i++) {
          if (
            data8[i].name === userName &&
            data8[i].friendWith === local_name
          ) {
            counter = counter + 1;
          }
        }

        if (counter !== 0) {
          res.render("feedBy", {
            title: userName,
            post_list: data,
            comment_list: data2,
            friend_list: data8,
            person: local_name
          });
        } else {
          postaus.find({}, function(err, data) {
            if (err) throw err;
            kommentti.find({}, function(err, data2) {
              if (err) throw err;
              pyynto.find({}, function(err, data5) {
                if (err) throw err;
                kaveri.find({}, function(err, data8) {
                  if (err) throw err;
                  var msg =
                    "Could't find '" + local_name + "' from your friends";
                  if (req.params.page === "feed") {
                    res.render("posts", {
                      title: userName,
                      post_list: data,
                      comment_list: data2,
                      message: msg,
                      friend_list: data8
                    });
                  } else {
                    kaveri.find({}, function(err, data8) {
                      if (err) throw err;
                      res.render("feedBy", {
                        title: userName,
                        post_list: data,
                        comment_list: data2,
                        friend_list: data8,
                        message: msg
                      });
                    });
                  }
                });
              });
            });
          });

          console.log("ei löytyny");
        }
      });
    });
  });
});

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

// var post1 = postTracker({
//   name: "postCounter",
//   id: -1
// }).save(function(err) {
//   if (err) throw err;
//   console.log("postTrcaker added");
// });

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

// var requets1 = requestTracker({
//   name: "requestCounter",
//   id: -1
// }).save(function(err) {
//   if (err) throw err;
//   console.log("requestTracker added");
// });

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

function updateRequestId() {
  requestTracker.find({}, function(err, requestID) {
    if (err) throw err;
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("database");
      var newval = requestID[0].id + 2;

      dbo
        .collection("rids")
        .updateOne(
          { name: "requestCounter" },
          { $set: { id: newval } },
          function(err, result) {
            console.log(result);
          }
        );
    });
  });
}

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

function updatePostId() {
  postTracker.find({}, function(err, postID) {
    if (err) throw err;
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("database");
      var newval = postID[0].id + 1;

      dbo
        .collection("ids")
        .updateOne({ name: "postCounter" }, { $set: { id: newval } }, function(
          err,
          result
        ) {
          console.log(result);
        });
    });
  });
}

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

router.post(
  "/create/:page",
  sanitizeBody("*")
    .trim()
    .escape(),
  function(req, res, next) {
    var local_post = req.body.content;
    var howBig = local_post.length;
    console.log("stringin pituus: " + howBig);
    console.log("We got content: " + local_post);

    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours() + 2;
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    console.log(
      year +
        "-" +
        month +
        "-" +
        date +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds
    );
    var time =
      year +
      "-" +
      month +
      "-" +
      date +
      " " +
      hours +
      ":" +
      minutes +
      ":" +
      seconds;

    if (howBig > 1000) {
      postaus.find({}, function(err, data) {
        if (err) throw err;
        kommentti.find({}, function(err, data2) {
          if (err) throw err;
          pyynto.find({}, function(err, data5) {
            if (err) throw err;
            kaveri.find({}, function(err, data8) {
              if (err) throw err;
              var takeThis =
                "Your post is now " +
                howBig +
                " characters long and it should less than 40.";
              res.render("mypage", {
                title: userName,
                post_list: data,
                comment_list: data2,
                user_list: data5,
                friend_list: data8,
                tooBigOrNot: takeThis
              });
            });
          });
        });
      });
    } else {
      postTracker.find({}, function(err, postID) {
        if (err) throw err;
        var postaus1 = postaus({
          postId: postID[0].id,
          personLoggedIn: userName,
          personPost: local_post,
          date: time
        }).save(function(err) {
          if (err) throw err;
          console.log("post added!");
        });
        updatePostId();
      });
      postaus.find({}, function(err, data3) {
        if (err) throw err;
        kommentti.find({}, function(err, data4) {
          if (err) throw err;
          pyynto.find({}, function(err, data5) {
            if (err) throw err;
            kaveri.find({}, function(err, data8) {
              if (err) throw err;
              res.render("mypage", {
                title: userName,
                post_list: data3,
                comment_list: data4,
                user_list: data5,
                friend_list: data8
              });
            });
          });
        });
      });
    }
  }
);

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

var id = 0;
var userName = "";

router.post(
  "/login",
  sanitizeBody("*")
    .trim()
    .escape(),

  function(req, res, next) {
    var user_Name = req.body.user;
    var user_Password = req.body.userpassword;
    userName = user_Name;

    kayttaja.find({}, function(err, data) {
      if (err) throw err;
      var userOrNot = 0;
      for (var i = 0; i < data.length; i++) {
        if (data[i].username === userName) {
          if (data[i].password === user_Password) {
            userOrNot++;
          }
        }
      }

      if (userOrNot === 0) {
        res.render("index", {
          title: "Naamakirja",
          message: "*You don't have user yet or username/password incorrect"
        });
      } else {
        res.redirect("/posts");
      }
    });
  }
);

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

router.post("/logout", function(req, res, next) {
  res.render("index", { title: "Naamakirja" });
});

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

router.post(
  "/writeComment/:postId/:page",
  sanitizeBody("*")
    .trim()
    .escape(),
  function(req, res, next) {
    var local_comment = req.body.commentContent;
    console.log("we got comment!" + local_comment);
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours() + 2;
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    console.log(
      year +
        "-" +
        month +
        "-" +
        date +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds
    );
    var time =
      year +
      "-" +
      month +
      "-" +
      date +
      " " +
      hours +
      ":" +
      minutes +
      ":" +
      seconds;

    var kommentti1 = kommentti({
      commentedPost: req.params.postId,
      commentor: userName,
      commentsForPost: local_comment,
      date: time
    }).save(function(err) {
      if (err) throw err;
      console.log("comment added!");
    });
    if (req.params.page === "feed") {
      res.redirect("/posts");
    }

    if (req.params.page === "mypage") {
      res.redirect("/posts/mypage?");
    } else {
      postaus.find({}, function(err, data) {
        if (err) throw err;
        kommentti.find({}, function(err, data2) {
          if (err) throw err;
          kaveri.find({}, function(err, data8) {
            if (err) throw err;
            res.render("feedBy", {
              title: userName,
              post_list: data,
              comment_list: data2,
              friend_list: data8,
              person: req.params.page
            });
          });
        });
      });
    }
  }
);

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

router.post(
  "/delete/:postId",
  sanitizeBody("*")
    .trim()
    .escape(),
  function(req, res, next) {
    postaus.find({}, function(err, postID) {
      if (err) throw err;
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("database");
        var deletethis = req.params.postId;
        console.log("id. " + req.params.postId);

        dbo
          .collection("posts")
          .deleteOne({ postId: req.params.postId }, function(err, obj) {
            if (err) throw err;
            console.log(obj);
          });
      });
    });
    postaus.find({}, function(err, data3) {
      if (err) throw err;
      kommentti.find({}, function(err, data4) {
        if (err) throw err;
        pyynto.find({}, function(err, data5) {
          if (err) throw err;
          kaveri.find({}, function(err, data8) {
            if (err) throw err;
            res.render("mypage", {
              title: userName,
              post_list: data3,
              comment_list: data4,
              user_list: data5,
              friend_list: data8
            });
          });
        });
      });
    });
  }
);

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

router.post(
  "/deleteFriend/:name/:friendname",
  sanitizeBody("*")
    .trim()
    .escape(),
  function(req, res, next) {
    kaveri.find({}, function(err, postID) {
      if (err) throw err;
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("database");
        var delete1 = req.params.name;
        var delete2 = req.params.friendname;
        console.log("name: " + req.params.name);
        console.log("friend: " + req.params.friendname);

        dbo
          .collection("friends")
          .deleteOne(
            { name: req.params.name, friendWith: req.params.friendname },
            function(err, obj) {
              if (err) throw err;
              console.log(obj);
            }
          );

        dbo
          .collection("friends")
          .deleteOne(
            { name: req.params.friendname, friendWith: req.params.name },
            function(err, obj) {
              if (err) throw err;
              console.log(obj);
            }
          );
      });
    });

    postaus.find({}, function(err, data3) {
      if (err) throw err;
      kommentti.find({}, function(err, data4) {
        if (err) throw err;
        pyynto.find({}, function(err, data5) {
          if (err) throw err;
          kaveri.find({}, function(err, data8) {
            if (err) throw err;
            res.render("mypage", {
              title: userName,
              post_list: data3,
              comment_list: data4,
              user_list: data5,
              friend_list: data8
            });
          });
        });
      });
    });
  }
);

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

router.get("/mypage", function(req, res, next) {
  postaus.find({}, function(err, data) {
    if (err) throw err;
    kommentti.find({}, function(err, data2) {
      if (err) throw err;
      pyynto.find({}, function(err, data5) {
        if (err) throw err;
        console.log(data);
        kaveri.find({}, function(err, data8) {
          if (err) throw err;
          res.render("mypage", {
            title: userName,
            post_list: data,
            comment_list: data2,
            user_list: data5,
            friend_list: data8
          });
        });
      });
    });
  });
});

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

router.post(
  "/signup",
  sanitizeBody("*")
    .trim()
    .escape(),
  function(req, res, next) {
    var local_user = req.body.user2;
    var local_password = req.body.userpassword2;
    var local_password2 = req.body.userpassword3;
    console.log("We got content: " + local_user);
    console.log("We got content: " + local_password);
    console.log("We got content: " + local_password2);

    if (local_password === local_password2) {
      var kayttaja1 = kayttaja({
        username: local_user,
        password: local_password
      }).save(function(err) {
        if (err) throw err;
        console.log("user added");
      });
      console.log("Voit nyt kirjautua");
      res.render("index", {
        title: "Naamakirja",
        message2: "You may now log in"
      });
    } else {
      console.log("wrong password");
      res.render("index", {
        title: "Naamakirja",
        message: "Please make sure to type password correctly twice"
      });
    }
  }
);

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

module.exports = router;
