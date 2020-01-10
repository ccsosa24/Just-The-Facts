var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/just-the-facts", { useNewUrlParser: true });
    

app.get("/scrape", function(req, res) {
    console.log("INSIDE SCRAPE")
    axios.get("https://news.ycombinator.com/").then(function(response){
        //console.log(response.data)
        var $ = cheerio.load(response.data);
      
        $(".title").each(function(i, element) {
            
            // console.log("-------------------------------------I")
            // console.log(i)
            // console.log("----------------------------ELEMENT")
            // console.log(element)
            var result ={};
            // console.log("=============================%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
            result.title = $(element).children("a").text();
            result.link = $(element).children("a").attr("href");

            // console.log(result.title = $(this).children("a").text())
            // console.log($(this).children("a").attr("href"))
            

            db.Article.create(result).then(function(dbArticle){
                console.log("YOUR IN ARICLES")
                console.log(dbArticle);
            })
            .catch(function(err) {
                console.log(err);
            });
            console.log("------------------------------------")
            console.log(result)
            console.log("-------------------------------------")
        });
        
        res.send("Scrape Complete");
    });
});

app.get("/articles", function(req, res) {
    db.Article.find().then(function(dvArticle) {
        res.json(dbArticle);
     })
     .catch(function(err){
         res.json(err);


         });
     });

app.get("/articles/:id", function(req, res){
    db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    });
});

app.post("/articles/:id", function(req, res) {
    db.Note.create(req.body)
    .then(function(dbNote){
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });

    })
    .then(function(err){
        res.json(err);
    })
    // .catch(function(err){
    //     res.json(err)
    // });
});          

app.get("/", function(req, res) {
    console.log("getroutes")
    res.render("index")
    // db.Article.find().then(function(dbArticle) {

    // //     res.json(dbArticle);
    // //  })
    // //  .catch(function(err){
    // //      res.json(err);


    // //      });
    
    // // .exec(function (err, found) {
    // //     if(err) throw err;
    // //     res.render("index", {
    // //         articles: found
    // //     })
    // //     res.json(found);
    // //     }
     });


app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});