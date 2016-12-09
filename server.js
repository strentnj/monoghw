//Initialize Express app
var express   = require('express');
var app     = express();
var bodyParser  = require('body-parser');
var logger    = require('morgan');
var mongoose  = require('mongoose');

var PORT    = process.env.PORT || 3000;

//Require request and cheerio - scraoers
var request   = require('request');
var cheerio   = require('cheerio');

//Database configuration
var mongojs   = require('mongojs');
//var databaseUrl = "scraper"; not sure I've got this right
var databaseUrl = 'mongodb://heroku_0lg3mvjl:jrbu5h4lo28svv7kds1k5mnut9@ds127948.mlab.com:27948/heroku_0lg3mvjl';
var collections = ["scrapedData"];

//Hook mongojs configuration to the db variable, not sure about this either 
var db = mongojs(databaseUrl, collections);
db.on('error', function(err){
  console.log('Database Error:', err);
});

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static('public'));

//Route to serve up the index page
app.get('/', function(req, res){
  res.send(index.html);
});

//Route to retrieve all of the data 
app.get('/all', function(req, res) {
  db.scrapedData.find({}, function (err, docs){
    
    res.json(docs);
    
    });  
});

//Route that receives data to update and add notes to the database
app.post('/noteBox/:id', function(req, res){
  var note = req.body;

  db.scrapedData.update({
      '_id': mongojs.ObjectId(req.params.id)}, 
      {
        $set: {
          'note':note.note
        }
      }, 
    function(err, edited){
      if (err){
        console.log(err);
        res.send(err);
      } 
      else{
        console.log(edited);
        res.send(edited);
      }

    });

    console.log(note);
});

//Route to delete notes from database based on id received
app.post('/deleteBox/:id', function(req, res){
  var note = req.body;

  db.scrapedData.update({
    '_id': mongojs.ObjectId(req.params.id)}, 
      {
        $set: {
          'note':" "
        }
      },
      function(err, edited){
        if (err) {
          console.log(err);
          res.send(err);
        } 
        else{
          console.log(edited);
          res.send(edited);
        }
      });

    console.log(note);
});

//Route scrapes data from the NPR news site, and saves it to MongoDB.
app.get('/scraper', function(req, res){

  request('http://www.npr.org/sections/news/', function (error, response, html){

  var $ = cheerio.load(html);
  
  $('div.item-info').each(function(i, element){


      var label = $(this).find('h2.title').text();
      var link = $(this).find('h2.title').attr('href');
      var teaser = $(this).find('p').text();
      console.log('link:', link);
      db.scrapedData.save({'_id': mongojs.ObjectId(req.params.id),
  "label":label, "teaser": teaser, "link": link});
    });
  
  });

      res.redirect('/');

});

// listen on port 3000
app.listen(PORT, function(){
  console.log('App running on port 3000!');
});
