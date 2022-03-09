const express = require("express");
const app = express();
const fs = require("fs");
var mysql = require("mysql");
//const bodyParser = require("body-parser");

const PORT = 5000;
app.listen(PORT, () => console.log(`listening at http://localhost:${PORT}`));

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
//show all users
/* app.get("/login", (req, res) => {
  let sql = "SELECT * FROM user_details";
  let query = connection.query(sql, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify(results));
  });
});

//show single user
app.get("/login/:name", (req, res) => {
  connection.query(
    "select * from user_details where name=?",
    [req.params.name],
    function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    }
  );
}); */

/* const userData = JSON.parse(fs.readFileSync("BookingDetails.json"));
// let users = [];
app.post("/bookedpassengersdata", (req, res) => {
  const newUser = {
    pnrnumber: req.body.pnrnumber,
    trainname: req.body.trainname,
    source: req.body.source,
    sourcedatetime: req.body.sourcedatetime,
    destination: req.body.destination,
    destinationdatetime: req.body.destinationdatetime,
    passengers: req.body.passengers,
  }; */

//   const ourData = req.body.name;

//   console.log(ourData);

/* userData[newUser.pnrnumber] = newUser; //
  //users.push(req.body);

  saveData(userData, "BookingDetails.json");

  res.json(`Data has been saved`);
});

//to get data
app.get("/login", (req, res) => {
  res.json(userData);
});

app.get("/login/:user", (req, res) => {
  var pnrnumber = req.params.pnrnumber;
  // Searching books for the isbn
  for (let data of users) {
    if (data.pnrnumber === pnrnumber) {
      res.json(data);
      return;
    }
  }

  // Sending 404 when not found something is a good practice
  res.status(404).send("Book not found");
  //console.log(user);
});
 */
