const express = require("express");
const app = express();
const fs = require("fs");
var mysql = require("mysql");
//const bodyParser = require("body-parser");

const PORT = 5000;
app.listen(PORT, () => console.log(`listening at http://localhost:${PORT}`));

//To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in
//middleware function in Express.
app.use(express.static("public")); //To link index.html file
app.use(express.json());

//create database connection
var connection = mysql.createConnection({
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

app.post("/bookedpassengersdata", (req, res) => {
  const newBooking = {
    pnrnumber: req.body.pnrnumber1,
    trainname: req.body.trainname,
    source: req.body.source,
    sourcedatetime: req.body.sourcedatetime,
    destination: req.body.destination,
    destinationdatetime: req.body.destinationdatetime,
    passengername: req.body.passengername,
    passengerage: req.body.passengerage,
    passengergender: req.body.passengergender,
    passengerseat: req.body.passengerseat,
    passengerstatus: req.body.passengerstatus,
    passengerseatnumber: req.body.passengerseatnumber,
  };
  let sql = "INSERT INTO booked_passengerdetails SET ?";
  let query = connection.query(sql, newBooking, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify(results));
  });
});
//show single user
app.get("/bookedpassengersdata/:pnrnumber", (req, res) => {
  connection.query(
    "select * from booked_passengerdetails where pnrnumber=?",
    [req.params.pnrnumber],
    function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    }
  );
});

app.put("/bookedpassengersdata/:pnrnumberCancel", (req, res) => {
  const newBooking = {
    pnrnumber:req.body.pnrnumber,
    passengerseat:req.body.CancelBerth,
    passengername:req.body.CancelName,
    passengerseatnumber:req.body.CancelSeatNo,
    passengerstatus:req.body.CancelStatus
  };

  let sql="UPDATE booked_passengerdetails SET passengerseat='"+req.body.CancelBerth+"', passengerseatnumber='"+req.body.CancelSeatNo+ "', passengerstatus='"+req.body.CancelStatus+ "' WHERE pnrnumber='"+req.body.pnrnumber+"' AND passengername='"+req.body.CancelName+"'";
  
  //let sql ="UPDATE booked_passengerdetails WHERE pnrnumber=? AND passengername=?",[pnrnumber,passengername];
  let query = connection.query(sql,(err, results) => {
    if (err) throw err;
    res.send(JSON.stringify(results));
  });
});













//JSON updation
const trainsData = JSON.parse(fs.readFileSync("./public/trainList.json"));
// let users = [];
const saveData = (data, file) => {
  const finished = (error) => {
    if (error) {
      console.error(error);
      return;
    }
  };

  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFile(file, jsonData, finished);
};
saveData(trainsData, "./public/trainList.json");

app.post("/train/:index1", (req, res) => {
  // Reading isbn from the URL
  const index1 = req.body.index1;
  const index2 = req.body.index2;
  const index3 = req.body.index3;
  const UpdatedSeats = req.body.UpdatedSeats;
  //console.log(trainsData, index1, index2, index3, UpdatedSeats);

  trainsData[index1]["junctions"][index2]["Available_Seat"][index3] =
    UpdatedSeats;
  saveData(trainsData, "./public/trainList.json");
  res.json(`${trainsData[index1].train_name} Number of seats is updated`);
});
