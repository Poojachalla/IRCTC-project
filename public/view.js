/* import "../core-js/actual";
 */
/******* CLASS VIEW  ******************/
class View {
  _trainlistElement = document.querySelector(".train-list");
  _source = document.querySelector(".source");
  _destination = document.querySelector(".destination");
  _date = document.querySelector(".form__date");
  _searchButton = document.querySelector(".btn__search");
  _pnrnumber = document.querySelector(".form__input--PNR");
  _pnrsearchButton = document.querySelector("#form__btn--PNR");
  // _trainsFoundlist;
  //_status;
  _pnrnumberlist;
  _passengerdetails = [];
  _trainslist;
  _helperHandler;
  _currentDate = new Date().toISOString().split("T")[0];

  _places = [
    "Anakapalle",
    "Tirupati",
    "Gundur",
    "Nellore",
    "Kavali",
    "Ongole",
    "Chirala",
    "Tenali",
    "Vijayawada",
    "Warangal",
    "Secunderabad",
    "Nizamabad",
    "Adilabad",
    "Vishakapatnam",
    "Rajamundry",
    "Eluru",
    "Hyderabad",
    "Guntur",
    "Chennai Central",
    "Mahbubabad",
    "Kazipet",
    "Kondapalli",
    "Khammam",
    "Ghanpur",
    "New Delhi",
    "Agra Cantt",
    "Gwalior",
    "Bhopal",
    "Nagpur",
    "Chandrapur",
    "Balharshah",
    "Sirpur Kagazngr",
    "Ramgundam",
  ];

  constructor() {
    this.BookTicket(this._searchButton);
  }

  BookTicket() {}

  setDatefieldInBookingSection() {
    document.querySelector(".form__date").value = this._currentDate;
    document.querySelector(".form__date").min = this._currentDate;
  }
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

  removeTrainDetailsMovements() {
    document.querySelector(".train-list").innerHTML = "";
  }

  displayMovements(trainslist) {
    this._trainslist = trainslist;
    this.removeTrainDetailsMovements(); //(or).textContent=0
    //console.log(this._trainslist);
    trainslist.forEach((mov, index) =>
      //const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

      //console.log(trainslist);
      {
        let temp, col;
        if (mov[4][2].slice(0, 1) === "W") {
          temp = "Waiting List:" + mov[4][2];
          col = "#ff3838";
        } else {
          temp = "Available Seats:" + mov[4][2];
          col = "#7dd035";
        }
        if (mov[5] === "TRAIN DEPARTED") {
          temp = "TRAIN DEPARTED";
          col = "#ff3838";
        }
        if (mov[5] === "NOT AVAILABLE") {
          temp = "NOT AVAILABLE";
          col = "#ff3838";
        }

        const html = `
        <div class="movements__row">
            <div class="movements__type movements__type--train">
            ${mov[0].train_name} (${mov[0].train_number})
            </div>
            <div class="train-details">
              <div class="train-stations">
              <span class="train-time-source">${Object.values(mov[1])[0]}</span>
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
              <span class="train-time-destination">${
                Object.values(mov[2])[0]
              }</span>
              <br />
              </div>
              <div class="train-dates">
              <span class="Train-Start-date">
                <span class="train-timings">${
                  mov[1].Time
                }</span> ${this.getDateFormat(mov[4][0])}</span
              >
              <span class="Train-End-date">
                <span class="train-timings">${
                  mov[2].Time
                } </span> ${this.getDateFormat(mov[4][1])}</span
              >
              </div>
              <br />
              <div class="Available-seats" style="background-color: ${col};">
                ${temp}
              </div>
            </div>
          </div>`;

        document
          .querySelector(".train-list")
          .insertAdjacentHTML("afterbegin", html); //this._trainlistElement this keyword is not working
      }
    );
  }

  /*autoComplete feature*/
  AutoCompleteForFromANDTo() {
    let options = "";

    for (let i = 0; i < this._places.length; i++) {
      options += '<option value="' + this._places[i] + '" />';
    }

    document.getElementById("From").innerHTML = options;
    document.getElementById("To").innerHTML = options;
  }

  //Search button click function
  bindSearchTrainsButton(handler) {
    //this.autocomplete(document.getElementById("myInput"), this._places);
    this._searchButton.addEventListener("click", (event) => {
      event.preventDefault();

      //this.closeAllLists(event.target);

      if (
        !this._source.value ||
        !this._destination.value ||
        !this._date.value
      ) {
        alert("Please enter all fields");
        this.removeTrainDetailsMovements();
      } /* else if (new Date(this._date.value) < new Date()) {
        alert("please enter correct date");
      } */ else {
        handler(
          this._source.value.trimStart().trimEnd(),
          this._destination.value.trimStart().trimEnd(),
          this._date.value
        );

        this._source.value = "";
        this._destination.value = "";
        this._date.value = this._currentDate;
      }
    });
  }

  bindAvailableSeatsClick(handler) {
    this._helperHandler = handler;
    this.getModel1Elements();
    //console.log(this._openButton1);
    document.querySelectorAll(".Available-seats").forEach((ele) => {
      if (
        ele.textContent.trim() != "TRAIN DEPARTED" &&
        ele.textContent.trim() != "NOT AVAILABLE"
      ) {
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
        });
      }
    });
  }

  bindModelWindow1Close() {
    this._closeButton1[0].addEventListener("click", (event) => {
      event.preventDefault();
      this._modal1.classList.add("hidden");
      this._overlay[0].classList.add("hidden");
      document.querySelectorAll(".Available-seats").forEach((ele) => {
        if (
          ele.textContent.trim().slice(0, 1) === "W" ||
          ele.textContent.trim() === "TRAIN DEPARTED" ||
          ele.textContent.trim() === "NOT AVAILABLE"
        ) {
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

    this.OnlickAddPassenger(handler);
  }

  OnlickAddPassenger(handler) {
    document.querySelectorAll(".add-passenger").forEach((ele, i) => {
      ele.style.pointerEvents = "auto";
      ele.addEventListener("click", (e) => {
        e.preventDefault(); //neccessary to prevent default event
        e.stopImmediatePropagation(); //This helps by stopping event from firing more than once
        this.getEnteredPassengerDetails(i + 1, handler, e);
        return;
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
          } else {
            val.push(ele.value);
          }
        }
      });

      if (check) {
        //console.log("inside entered");
        this._passengerdetails.push(val);

        //To remove duplicates
        //this._passengerdetails = Array.from(new Set(this._passengerdetails)); */
        //this._passengerdetails = Array.from(this._passengerdetails);
        //console.log(this._passengerdetails);

        elements[elements.length - 1].value = "Added Passenger";
        clickElement.target.style.backgroundColor = "red";
        clickElement.target.style.pointerEvents = "none";
        //clickElement.target.classList.add("onClick");

        document.querySelector(".Confirm_Booking").classList.remove("hidden");
        this.OnclickConfirmBooking(handler);
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
      if (isNaN(val) || val < 5 || val > 100) {
        //age must be between 5-100
        alert("The age must be a number between 5 and 100");
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
      if (val === "" || regx.test(val) === false) {
        alert("Please enter valid phone Number");
        ele.value = "";
        return false;
      }
    }
  }

  OnclickConfirmBooking(handler) {
    document
      .querySelector(".Confirm_Booking")
      .addEventListener("click", (event) => {
        //event.preventDefault();
        //event.target.style.backgroundColor = "red";
        event.stopImmediatePropagation();
        /* this.showBookingCompletedWindow(); */
        console.log(this._passengerdetails);
        handler(this._passengerdetails);
      });
  }

  showBookingCompletedWindowWithPNRNumber(pnrNumber) {
    document.querySelector(".PNR").textContent = pnrNumber;
    this.showBookingCompletedWindow();
  }
  showBookingCompletedWindow() {
    document.querySelector(".passengers").classList.add("hidden");
    document
      .querySelector(".Book-ticket-section-heading")
      .classList.add("hidden");
    document.querySelector(".Booking_done").classList.remove("hidden");
  }

  updateUIWithUpdatedAvailableSeats(Selected_train, seats) {
    Selected_train = Selected_train.querySelector(".movements__type--train")
      .textContent.replace(/\s+/g, "")
      .split(")");
    Selected_train = Selected_train[0].split("(");
    this._trainslist.forEach(function (mov, index) {
      if (Selected_train[1] === mov[0].train_number) mov[4][2] = seats;
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
      movements.querySelector(".Train-Start-date").textContent.trimStart(),
      movements.querySelector(".train-time-destination").textContent.trimEnd(),
      movements.querySelector(".Train-End-date").textContent.trimStart(),
    ];
  }

  bindpnrsearch(handler) {
    this._pnrsearchButton.addEventListener("click", (event) => {
      event.preventDefault();
      if (!this._pnrnumber.value) {
        alert("PNR Number can't be Null.Please enter PNR number");
      } else if (this._pnrnumber.value.length !== 10) {
        alert("Please enter valid  9 digit PNR number");
      } else {
        handler(this._pnrnumber.value.trimStart().trimEnd());
        this._pnrnumber.value = "";
      }
    });
  }
  getModelpnrElements() {
    this._overlay1 = document.querySelectorAll(".overlay");
    this._openButton2 = document.querySelectorAll("#form__btn--PNR");
    this._closeButtonpnr = document.querySelectorAll(".close-modal1");
    this._modalPNR = document.querySelector(".modal2-PNR-details");

    this._PNRNumber = document.querySelector(".PNR-no");
    this._PNRTrainNameNumber = document.querySelector(".PNR-Train-name-number");
    this._PNRSource = document.querySelector(".PNR-source");
    this._PNRDestination = document.querySelector(".PNR-destination");
    this._PNRDateofjourneyTime = document.querySelector(
      ".PNR-dateofjourney-time"
    );
  }

  bindModelWindowpnr(pnrnumberFoundlist) {
    this.getModelpnrElements();
    this._overlay1[1].classList.remove("hidden1");
    //console.log(pnrnumberFoundlist, typeof pnrnumberFoundlist);

    this._PNRNumber.textContent = pnrnumberFoundlist[0].pnrnumber;
    this._PNRTrainNameNumber.textContent = pnrnumberFoundlist[0].trainname;
    this._PNRSource.textContent = pnrnumberFoundlist[0].source;
    this._PNRDestination.textContent = pnrnumberFoundlist[0].destination;
    this._PNRDateofjourneyTime.textContent =
      pnrnumberFoundlist[0].sourcedatetime;
    document.querySelector(".table-body").innerHTML = "";
    pnrnumberFoundlist.forEach((ele, index) => {
      if (ele.passengerstatus === "WL") {
        ele.passengerseat = "NA";
        ele.passengerstatus = ele.passengerseatnumber;
        ele.passengerseatnumber = "NA";
      }
      const html = `<tr>
                <td>Passenger-${index + 1}</td>
                <td>${ele.passengername}</td>
                <td>${ele.passengerage}</td>
                <td>${ele.passengergender}</td>
                <td>${ele.passengerstatus}</td>
                <td>${ele.passengerseat}</td>
                <td>${ele.passengerseatnumber}</td>
              </tr>`;
      document
        .querySelector(".table-body")
        .insertAdjacentHTML("beforeend", html);
    });
    this._modalPNR.classList.remove("hidden1");
  }

  bindModelPNRWindowClose() {
    this.getModelpnrElements();
    this._closeButtonpnr[1].addEventListener("click", (event) => {
      event.preventDefault();
      this._modalPNR.classList.add("hidden1");
      this._overlay1[1].classList.add("hidden1");
    });
  }
}

export default new View();
