const express = require("express");
const app = express();
const fs = require("fs");
let mysql = require("mysql");
//const bodyParser = require("body-parser");

//MONGODB modules
let MongoClient = require('mongodb').MongoClient;
let mongoose = require('mongoose');     //Its a adopter To connect node.js environment with mongodb server
let url = "mongodb://localhost:27017/mydb";  //creating a databse called trainsData

const PORT = 4500;
app.listen(PORT, () => console.log(`listening at http://localhost:${PORT}`));

//To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in
//middleware function in Express.
app.use(express.static("public")); //To link all files in public folder
app.use(express.json());

//To create MongoDB Database
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});

//To create MongoDB collection
/* MongoClient.connect("mongodb://localhost:27017/", function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  dbo.createCollection("trainsData", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    db.close();
  });
}); */

//To read JSON file
const TrainsData = JSON.parse(fs.readFileSync("./public/trainList.json"));

//To insert document in the trainsData collection
/* MongoClient.connect("mongodb://localhost:27017/", function(err, db) {
  if (err) throw err;
  let dbo = db.db("mydb");
  dbo.collection("trainsData").insertMany(TrainsData, function(err, res) {
    if (err) throw err;
    console.log("Number of documents inserted: " + res.insertedCount);
    db.close();
  });
}); */

//To select data from a documents in MongoDB,
app.get("/trainsDetails", (req, res) => {
MongoClient.connect("mongodb://localhost:27017/", function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  dbo.collection("trainsData").find({}).toArray(function(err, result) {
    if (err) throw err;
    //console.log(result);
    res.end(JSON.stringify(result));
    db.close();
  });
});
});

//To update seats availablity field of a particular train in Mongodb 
app.post("/trainsDetails/:trainName", (req, res) => {
  const trainName = req.body.trainName;
  const stationIndex = req.body.StationIndex;
  const UpdatedSeats = req.body.UpdatedSeats;
  const dateIndex=req.body.dateIndex;
  const time=req.body.time;
  //let stationName=req.body.stationName;
  //const OldSeats=req.body.OldSeats;
  //const Station = req.body.Station;
  //const date = req.body.date;
  
  //console.log(stationIndex,dateIndex,time);

  
  MongoClient.connect("mongodb://localhost:27017/", function(err, db) {
    if (err) throw err;
    let dbo = db.db("mydb");


    let myquery = { 'train_name': trainName,[`junctions.${stationIndex}.Time`]:time}; //,'junctions.Time':time,[value]: OldSeats};
    let newvalues = {$set: {[`junctions.${stationIndex}.Available_Seat.${dateIndex}`]: UpdatedSeats}};

    dbo.collection("trainsData").updateOne(myquery, newvalues, function(err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
    });

});
});


//***************SQL CONNECTION**********************

//create database connection
let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "IRCTC",
});

//connect to database
connection.connect(function (err) {
  if (err) throw err;
  console.log("You are now connected...");
});

app.use(express.json());

//const userData = JSON.parse(fs.readFileSync("login.json"));


//To send booked trains data into booked_traindetails table in database
app.post("/bookedTraindata",(req, res) => {
  const newBookingTrainDetails = {
    pnrnumber: req.body.pnrnumber1,
    trainname: req.body.trainname,
    source: req.body.source,
    sourcedatetime: req.body.sourcedatetime,
    destination: req.body.destination,
    destinationdatetime: req.body.destinationdatetime,
  };
  let sqlTraindetails = "INSERT INTO booked_traindetails SET ?";
  let query = connection.query(sqlTraindetails, newBookingTrainDetails, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify(results));
  });

});


//To send booked passengers data into booked_passengerdetails table in database
app.post("/bookedpassengersdata", (req, res) => {
  const newBookingPassengerDetails = {
    pnrnumber1: req.body.pnrnumber1,
    passengername: req.body.passengername,
    passengerage: req.body.passengerage,
    passengergender: req.body.passengergender,
    passengerseat: req.body.passengerseat,
    passengerstatus: req.body.passengerstatus,
    passengerseatnumber: req.body.passengerseatnumber,
  };
  
  let sqlPassengerDetails = "INSERT INTO booked_passengerdetails SET ?";
  let query = connection.query(sqlPassengerDetails, newBookingPassengerDetails, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify(results));
  });
});


//show train deatils and passenger details by PNR number
app.get("/bookedpassengersdata/:pnrnumber", (req, res) => {
  connection.query(
    "SELECT bt.pnrnumber,bt.trainname,bt.source,bt.destination,bt.sourcedatetime,bp.passengername,bp.passengerage,bp.passengergender,bp.passengerstatus,bp.passengerseat,bp.passengerseatnumber FROM booked_traindetails bt JOIN booked_passengerdetails bp ON (bp.pnrnumber1=bt.pnrnumber) where pnrnumber=?",
    [req.params.pnrnumber],
    function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    }
  );
});

//To update booked passenger details after cancellation by pnrnumber
app.put("/bookedpassengersdata/:pnrnumberCancel", (req, res) => {
  const newBooking = {
    pnrnumber1:req.body.pnrnumber,
    passengerseat:req.body.CancelBerth,
    passengername:req.body.CancelName,
    passengerseatnumber:req.body.CancelSeatNo,
    passengerstatus:req.body.CancelStatus
  };

  let sql="UPDATE booked_passengerdetails SET passengerseat='"+req.body.CancelBerth+"', passengerseatnumber='"+req.body.CancelSeatNo+ "', passengerstatus='"+req.body.CancelStatus+ "' WHERE pnrnumber1='"+req.body.pnrnumber+"' AND passengername='"+req.body.CancelName+"'";
  
  //let sql ="UPDATE booked_passengerdetails WHERE pnrnumber=? AND passengername=?",[pnrnumber,passengername];
  let query = connection.query(sql,(err, results) => {
    if (err) throw err;
    res.send(JSON.stringify(results));
  });
});
