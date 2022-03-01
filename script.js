"use strict";

class Model {
  _trainsDetails = "";
  _trainJunctions = "";
  _trainDates = "";
  _trainStations = "";
  _trainTime = "";
  _trainAvlSeats = "";
  constructor() {
    this.getJSONData();
  }

  getTrainDetailsByJunctionIndex(index) {
    return this._trainsDetails[index];
  }

  getJunctions() {
    this._trainJunctions = this._trainsDetails.map(function (item, index) {
      return item["junctions"];
    });
    console.log(this._trainJunctions);
  }

  getJunctionsDates() {
    this._trainDates = this._trainsDetails.map(function (item, index) {
      return item["junctions"].map((res) => res["Date"]); //returns array of junctions dates of all trains
    });

    console.log(this._trainDates);
  }

  getJunctionsStations() {
    this._trainStations = this._trainsDetails.map(function (item, index) {
      return item["junctions"].map((res, i) => res[`Station-${i + 1}`]); //returns array of junctions stations of all trains
    });
    console.log(this._trainStations);

    /* console.log(this.getJunctionStationsByIndex(3, 5)); */
  }

  getJunctionStationsByIndex(index1, index2) {
    return this._trainJunctions[index1][index2];
  }

  getJunctionsTime() {
    this._trainTime = this._trainsDetails.map(function (item, index) {
      return item["junctions"].map((res, i) => res["Time"]); //returns array of junctions stations of all trains
    });
    console.log(this._trainTime);
  }

  getJunctionsAvlSeats() {
    this._trainAvlSeats = this._trainsDetails.map(function (item, index) {
      return item["junctions"].map((res, i) => res["Available_Seat"]); //returns array of junctions stations of all trains
    });
    console.log(this._trainAvlSeats);

    //testing
    //this.searchTrain("Vijayawada", "Secundrabad", "2022-03-02");
  }

  CalculateTimeDifference(start, end) {
    var t1parts = start.Time.split(":");
    var t1cm = Number(t1parts[0]) * 60 + Number(t1parts[1]);

    var t2parts = end.Time.split(":");
    var t2cm = Number(t2parts[0]) * 60 + Number(t2parts[1]);

    var hour = Math.floor((t1cm - t2cm) / 60);
    var min = Math.floor((t1cm - t2cm) % 60);
    return Math.abs(hour) + "h " + Math.abs(min) + "m";
  }

  searchTrain(source, destination, date) {
    //console.log(source, destination, date);
    let status = false; //To check if train is found are not false=NOT found
    let trainsFound = [];
    let timediff;
    /* NOTE: index1=index of matched junctions point, index2= index of matched source station,
     index3= index of matched destination station */
    this._trainJunctions.forEach((res1, index1) => {
      res1.forEach((res2, index2) => {
        if (res2[`Station-${index2 + 1}`] === source && res2["Date"] === date) {
          //console.log(source, date, index1, index2);
          this._trainJunctions[index1].forEach((des, index3) => {
            //To check source index is less than destination index
            if (
              des[`Station-${index3 + 1}`] === destination &&
              index2 < index3
            ) {
              //console.log(source, date, destination, index1, index2, index3);
              status = true;
              timediff = this.CalculateTimeDifference(
                this.getJunctionStationsByIndex(index1, index2),
                this.getJunctionStationsByIndex(index1, index3)
              );
              trainsFound.push([
                this.getTrainDetailsByJunctionIndex(index1),
                this.getJunctionStationsByIndex(index1, index2),
                this.getJunctionStationsByIndex(index1, index3),
                timediff,
              ]);
            }
          });
        }
      });
    });

    //console.log(trainsFound);
    return [trainsFound, status];
  }

  getTrainsDetails(source, destination, date) {
    //console.log(this._trainsDetails[0]["junctions"]);

    return this.searchTrain(source, destination, date);
  }

  async getJSONData() {
    try {
      const res = await fetch("trainList.json");
      const data = await res.json();
      /* this._trainsDetails = JSON.stringify(data); */
      this._trainsDetails = data;
    } catch (err) {
      console.error("error: " + err);
    }

    this.getJunctions();
    this.getJunctionsDates();
    this.getJunctionsStations();
    this.getJunctionsTime();
    this.getJunctionsAvlSeats();

    /* 
    console.log(this._trainsDetails[0]["junctions"]); */
  }

  async updateJSONWithUpdatedAvailableSeats() {}

  storeDataOfBookedTicketIntoDataBase(BookedPassengersdata) {
    console.log(BookedPassengersdata); //this contains booked passengers information
  }
}

/******* CLASS VIEW  ******************/
class View {
  _trainlistElement = document.querySelector(".train-list");
  _source = document.querySelector(".source");
  _destination = document.querySelector(".destination");
  _date = document.querySelector(".form__date");
  _searchButton = document.querySelector(".btn__search");
  _trainsFoundlist;
  _status;
  _passengerdetails = [];
  _trainslist;
  _helperHandler;
  /* _prevDetails = []; */

  constructor() {
    this.BookTicket(this._searchButton);
  }

  BookTicket() {}

  /*model window-1*/
  getModel1Elements() {
    this._overlay = document.querySelectorAll(".overlay");
    this._openButton1 = document.querySelectorAll(".Available-seats");
    this._closeButton1 = document.querySelectorAll(".close-modal1");
    this._modal1 = document.querySelector(".modal1-passenger-details");
    this._passengerNo = document.querySelector(".passengers-number");
  }

  getDateFormat(date) {
    let d = new Date(date);
    let options = {
      weekday: "short",
      year: "numeric",
      day: "numeric",
      month: "short",
    };
    let n = d.toLocaleDateString("en-US", options);
    let newDate = n.replace(new RegExp(",", "g"), " ");
    return newDate;
  }

  displayMovements(trainslist) {
    this._trainslist = trainslist;
    this._trainlistElement.innerHTML = ""; //(or).textContent=0

    //const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

    //console.log(trainslist);
    trainslist.forEach((mov, index) => {
      let temp, col;
      if (mov[1].Available_Seat.slice(0, 1) === "W") {
        temp = "Waiting List";
        col = "#ff3838";
      } else {
        temp = "Available Seats";
        col = "#7dd035";
      }
      const html = `
      <div class="movements__row">
          <div class="movements__type movements__type--train">
          ${mov[0].train_name} (${mov[0].train_number})
          </div>
          <div class="train-details">
            <span class="train-time-source">${mov[1].Time} ${
        Object.values(mov[1])[0]
      }
      </span>
            <span class="icon">
              <img
                alt="arrow"
                src="https://www.confirmtkt.com/img/icons/grey.svg"
                width="20px"
              />
            </span>
            <span class="duration">${mov[3]}</span>
            <span class="icon">
              <img
                alt="arrow"
                src="https://www.confirmtkt.com/img/icons/grey.svg"
                width="20px"
              />
            </span>
            <span class="train-time-destination">${mov[2].Time} ${
        Object.values(mov[2])[0]
      }
    </span>
            <br />
            <div class="train-dates">
              <span class="Train-Start-date">${this.getDateFormat(
                mov[1].Date
              )}</span>
              <span class="Train-End-date">${this.getDateFormat(
                mov[2].Date
              )}</span>
            </div>
            <br />
            <div class="Available-seats" style="background-color: ${col};">
              ${temp}:${mov[1].Available_Seat}
            </div>
          </div>
        </div>`;

      //${new Date(`${mov[1].Date}`).slice(1,13)}
      document
        .querySelector(".train-list")
        .insertAdjacentHTML("afterbegin", html); //this._trainlistElement this keyword is not working
    });
  }

  bindSearchTrainsButton(handler) {
    this._searchButton.addEventListener("click", (event) => {
      event.preventDefault();

      if (!this._source.value || !this._destination.value || !this._date.value)
        alert("Please enter all fields");
      else {
        handler(this._source.value, this._destination.value, this._date.value);

        this._source.value = "";
        this._destination.value = "";
        this._date.value = "2022-03-01";
      }
    });
  }

  bindAvailableSeatsClick(handler) {
    this._helperHandler = handler;
    this.getModel1Elements();
    //console.log(this._openButton1);
    document.querySelectorAll(".Available-seats").forEach((ele) => {
      ele.addEventListener("click", (event) => {
        ele.style.backgroundColor = "#a9b6af";
        event.preventDefault();
        this._modal1.classList.remove("hidden");
        this._overlay[0].classList.remove("hidden");

        document.querySelector(".passengers").classList.remove("hidden");
        document
          .querySelector(".Book-ticket-section-heading")
          .classList.remove("hidden");
        document.querySelector(".Booking_done").classList.add("hidden");

        const movementSelected = event.target.closest(".movements__row");
        if (!movementSelected) return;

        handler(movementSelected);
        /* const { updateTo } = event.target.closest(".movements__row").dataset;
        console.log(updateTo); */
      });
    });
  }

  bindModelWindow1Close() {
    this._closeButton1[0].addEventListener("click", (event) => {
      event.preventDefault();
      this._modal1.classList.add("hidden");
      this._overlay[0].classList.add("hidden");
      document.querySelectorAll(".Available-seats").forEach((ele) => {
        //console.log(ele.textContent, ele.value);
        if (ele.textContent.trim().slice(0, 1) === "W") {
          ele.style.backgroundColor = "#ff3838";
        } else {
          ele.style.backgroundColor = "#7dd035";
        }
      });
      /* document
        .querySelectorAll(".Confirm_Booking")
        .forEach((e) => (e.style.backgroundColor = "#87dcbc")); */

      //To reset Number of passengers field value
      this.resetPassengerNumberfield();
    });
  }

  bindSelectPassengers(handler) {
    this.getModel1Elements();
    this._passengerNo.addEventListener("change", (event) => {
      event.preventDefault();
      this.helperToResetNoOfpassengerFeilds(event);
      const value = event.target.value;
      this.addPassengersDetailsFields(value, handler);

      /* console.log(this._passengerdetails); */
      //this.OnclickConfirmBooking(this._passengerdetails, handler);

      //handler(value);
    });
  }

  helperToResetNoOfpassengerFeilds() {
    for (let i = 0; i < 4; i++) {
      document
        .querySelector(`.Passenger-${i + 1}`)
        .classList.add("hidden-passenger");
    }
    document.querySelector(`.passengers`).classList.remove("passenger-scroll");
    document
      .querySelectorAll(".add-passenger")
      .forEach((e) => (e.style.backgroundColor = "#87dcbc"));

    /* To reset form Fields*/
    for (let i = 0; i < 4; i++) {
      document.querySelector(`.Passenger-${i + 1}`).reset();
      document.querySelectorAll(".add-passenger")[i].value = "Add Passenger";
    }

    document.querySelector(".Confirm_Booking").classList.add("hidden");
    //To reset _passengerdetails array
    this._passengerdetails = [];
  }

  resetPassengerNumberfield() {
    this._passengerNo.value = "Select number of passengers";
    document.querySelector(".Confirm_Booking").classList.add("hidden");

    //["input[type=text], textarea"]
    this.helperToResetNoOfpassengerFeilds();
  }

  addPassengersDetailsFields(value, handler) {
    if (value > 1) {
      document.querySelector(`.passengers`).classList.add("passenger-scroll");
    } else {
      document
        .querySelector(`.passengers`)
        .classList.remove("passenger-scroll");
    }
    for (let i = 0; i < value; i++) {
      document
        .querySelector(`.Passenger-${i + 1}`)
        .classList.remove("hidden-passenger");
    }

    this.OnlickAddPassenger(value, handler);
  }

  OnlickAddPassenger(value, handler) {
    document.querySelectorAll(".add-passenger").forEach((ele, i) => {
      ele.addEventListener("click", (e) => {
        e.preventDefault(); //neccessary
        /* console.log("Clicked add passenger", e);
        /* e.target.value = "Added Passenger" */
        e.stopImmediatePropagation(); //This helps by stopping event from firing more than once
        this.getEnteredPassengerDetails(i + 1, handler, e);
      });
    });
  }

  getEnteredPassengerDetails(value, handler, clickElement) {
    let val = [];
    if (
      document
        .querySelector(`.Passenger-${value}`)
        .classList.contains("hidden-passenger")
    ) {
      return;
    } else {
      let elements = [
        ...document.querySelector(`.Passenger-${value}`).elements,
      ];
      //console.log(elements);
      let check = true;
      elements.forEach((ele, index) => {
        if (index != elements.length - 1) {
          if (this.validatePassengersDetails(ele, ele.value, index) === false) {
            check = false;
            this.OnlickAddPassenger(value, handler);
            /* if (this.validatePassengersDetails(ele, ele.value, index) === false) {
              this.validatePassengersDetails(ele, ele.value, index);
              check = false;
            }*/
          } else {
            check = true;
            val.push(ele.value);
          }
        }
      });

      /* let check = true; */
      /* if (val) {
        val.forEach((e, index) => {
          console.log("entered check is false");
          if (this.validatePassengersDetails(e, index) === false) {
            check = false;
          } else check = true;
        });
      } */
      if (check) {
        //console.log("inside entered");
        this._passengerdetails.push(val);

        //To remove duplicates
        this._passengerdetails = new Set(this._passengerdetails);
        this._passengerdetails = Array.from(this._passengerdetails);

        //console.log(this._passengerdetails);
        elements[elements.length - 1].value = "Added Passenger";
        clickElement.target.style.backgroundColor = "red";

        document.querySelector(".Confirm_Booking").classList.remove("hidden");
        this.OnclickConfirmBooking(this._passengerdetails, handler);
      }
    }

    //Before clicking "confirm booking button" if User changes no.of passengers or close the model window
    this.bindSelectPassengers(handler);
    this.bindModelWindow1Close();
  }

  validatePassengersDetails(ele, val, index) {
    if (index === 0) {
      if (val === null || val === "") {
        alert("Name can't be blank");
        ele.value = "";
        return false;
      }
    }
    if (index === 1) {
      if (val == "") {
        alert("Age can't be blank");
        ele.value = "";
        return false;
      }
      if (isNaN(val) || val < 1 || val > 100) {
        alert("The age must be a number between 1 and 100");
        ele.value = "";
        return false;
      }
    }
    if (index === 2) {
      if (val === "Gender") {
        alert("Please select gender");
        ele.value = "Gender";
        return false;
      }
    }
    if (index === 3) {
      if (val === "Berth type") {
        alert("Please select Berth type");
        ele.value = "Berth type";
        return false;
      }
    }
    if (index === 4) {
      let regx = /^[6-9]\d{9}$/;
      //console.log(regx.test(val));
      if (val === "" || regx.test(val) === false) {
        alert("Please enter valid phone Number");
        ele.value = "";
        return false;
      }
    }
  }

  OnclickConfirmBooking(details, handler) {
    //console.log("Entered into OnclickConfirmBooking");
    document
      .querySelector(".Confirm_Booking")
      .addEventListener("click", (event) => {
        //event.preventDefault();
        //event.target.style.backgroundColor = "red";
        event.stopImmediatePropagation();
        this.showBookingCompletedWindow();
        //console.log(this._passengerdetails);
        handler(this._passengerdetails);
      });
  }

  showBookingCompletedWindow() {
    document.querySelector(".passengers").classList.add("hidden");
    document
      .querySelector(".Book-ticket-section-heading")
      .classList.add("hidden");
    document.querySelector(".Booking_done").classList.remove("hidden");
  }

  updateUIWithUpdatedAvailableSeats(Selected_train, seats) {
    //console.log(this._trainslist);
    Selected_train = Selected_train.querySelector(".movements__type--train")
      .textContent.replace(/\s+/g, "")
      .split(")");
    Selected_train = Selected_train[0].split("(");
    //console.log(Selected_train[1]);
    this._trainslist.forEach(function (mov, index) {
      if (Selected_train[1] === mov[0].train_number)
        mov[1].Available_Seat = seats;
    });
    this.displayMovements(this._trainslist);
    this.bindAvailableSeatsClick(this._helperHandler);
  }

  getTrainBookedDetails(movements) {
    return [
      movements
        .querySelector(".movements__type--train")
        .textContent.trimStart()
        .trimEnd(),
      movements.querySelector(".train-time-source").textContent.trimEnd(),
      movements.querySelector(".Train-Start-date").textContent,
      movements.querySelector(".train-time-destination").textContent.trimEnd(),
      movements.querySelector(".Train-End-date").textContent,
    ];
  }
}

/**************** CLASS CONTROLLER  ******************/
class Controller {
  _updatedAvailableSeats;
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.view.bindSearchTrainsButton(this.handleSearchTrains);
    //console.log("LAST");
  }

  init() {
    //Check if Click action call done for inside events of modal1 Window
    this.view.bindSelectPassengers(this.handleSelectPassengers);
  }

  handleSearchTrains = (source, destination, date) => {
    /* console.log("entered"); */
    [this._trainsFoundlist, this.status] = [
      ...this.model.getTrainsDetails(source, destination, date),
    ];

    //To check status whether trains are found or not
    if (this.status === false) {
      alert("No Trains Found");
    } else {
      //console.log("FOUND", this._trainsFoundlist);
      this.view.displayMovements(this._trainsFoundlist);
    }

    //Click action call to open modal1 Window
    this.view.bindAvailableSeatsClick(this.handleAvailableSeatsClick);
    this.view.bindModelWindow1Close();
  };

  handleAvailableSeatsClick = (movementSelected) => {
    //console.log(movementSelected);

    this._movementSelected = movementSelected;
    /* //Check if Click action call done for inside events of modal1 Window
    this.view.bindSelectPassengers(this.handleSelectPassengers); */
    this.init();
  };

  handleSelectPassengers = (value) => {
    // console.log("Entered2");
    console.log("Booked pasenger details:", value);
    console.log("Booked train details:", this._movementSelected);
    this.generateSeatNumber(value, this._movementSelected);
    this.generateUniquePNR(value);

    //Update in Movements View also set in JSON File.
    this.view.updateUIWithUpdatedAvailableSeats(
      this._movementSelected,
      this._updatedAvailableSeats
    );

    //TO update avaialble seats of trains in JSON file
    this.model.updateJSONWithUpdatedAvailableSeats();
  };

  getAvailableSeatsNumber(movementSelected) {
    let val = movementSelected
      .querySelector(".Available-seats")
      .textContent.replace(/\s+/g, "");
    return val.slice(val.indexOf(":") + 1);
  }

  generateSeatNumber(value, movementSelected) {
    let avlSeats = this.getAvailableSeatsNumber(movementSelected);
    //console.log(avlSeats);

    value.forEach((v) => {
      if (avlSeats.at(0) === "A" && Number(avlSeats.slice(1)) > 0) {
        v.push("CF");
        v.push(`${Math.random() * (99 - 1 + 1) + 1}SL`); //generating random seat number
        this._updatedAvailableSeats = `A${Number(avlSeats.slice(1)) - 1}`;
        avlSeats = this._updatedAvailableSeats;
      } else if (avlSeats.at(0) === "A" && Number(avlSeats.slice(1)) === 0) {
        this._updatedAvailableSeats = "W1";
        v.push("WL");
        avlSeats = this._updatedAvailableSeats;
      } else {
        //if (avlSeats.at(0) === "W" && Number(avlSeats.slice(1) > 0)) {
        this._updatedAvailableSeats = `W${Number(avlSeats.slice(1)) + 1}`;
        v.push("WL");
        avlSeats = this._updatedAvailableSeats;
      }
    });
    //console.log(value);
  }

  generateUniquePNR(value) {
    // console.log("Entered5");
    let Pnr = "";
    for (let i = 0; i < 5; i++) {
      Pnr += value[0][i].at(0);
    }
    Pnr += Math.floor(1000 + Math.random() * 9000); //Generating random 4 digit number
    value.push(Pnr);
    //console.log(value, this._movementSelected);

    //Store booked ticket details into dataBase
    let t = this.view.getTrainBookedDetails(this._movementSelected);
    console.log(t);
    value.push(t); //this.view.getTrainBookedDetails(this._movementSelected)); //To push selected train details into value array
    this.model.storeDataOfBookedTicketIntoDataBase(value);
  }
}

const app = new Controller(new Model(), new View());
