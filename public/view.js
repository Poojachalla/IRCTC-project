/************* CLASS VIEW  ******************/
/** class View it will handle all actions performed by user and also handles DOM Elements maniplation
*/
class View {
  //Private variables declaration
  _trainlistElement = document.querySelector(".train-list");
  _source = document.querySelector(".source");
  _destination = document.querySelector(".destination");
  _date = document.querySelector(".form__date");
  _searchButton = document.querySelector(".btn__search");
  _pnrnumber = document.querySelector(".form__input--PNR");
  _pnrsearchButton = document.querySelector("#form__btn--PNR");
  _pnrCancelsearchButton = document.getElementById("form__btn--Cancel-PNR");
  _pnrCancelnumber = document.querySelector(".form__input--cancel-PNR");
  _pnrnumberlist;
  _passengerdetails = [];
  _trainslist;
  _helperHandler;
  _currentDate = new Date().toISOString().split("T")[0];
  _places = ["Anakapalle", "Tirupati", "Gundur", "Nellore", "Kavali", "Ongole", "Chirala", "Tenali", "Vijayawada", "Warangal", "Secunderabad", "Nizamabad", "Adilabad", "Vishakapatnam", "Rajamundry", "Eluru", "Hyderabad", "Guntur", "Chennai Central", "Mahbubabad", "Kazipet", "Kondapalli", "Khammam", "Ghanpur", "New Delhi", "Agra Cantt", "Gwalior", "Bhopal", "Nagpur", "Chandrapur", "Balharshah", "Sirpur Kagazngr", "Ramgundam"];
  _stopTimeOut;
  constructor() { }

  /**
 * To set Date feild default as current date and to set calender field for Booking section
 */
  setDatefieldInBookingSection() {
    document.querySelector(".form__date").value = this._currentDate;
    document.querySelector(".form__date").min = this._currentDate;
  }

  /**
   * To get Model window-1 Booking section elements
   */
  getModel1Elements() {
    this._overlay = document.querySelectorAll(".overlay");
    this._openButton1 = document.querySelectorAll(".Available-seats");
    this._closeButton1 = document.querySelectorAll(".close-modal1");
    this._modal1 = document.querySelector(".modal1-passenger-details");
    this._passengerNo = document.querySelector(".passengers-number");
  }

  /**
   * To change date format for ex: 31/03/2022
   * @param {string} date
   * @returns {string} 
   */
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

  /**
   * To reset train details momements if train not found //doubt
   */
  removeTrainDetailsMovements() {
    document.querySelector(".train-list").innerHTML = "";
  }

  /**
   * To display trains found after clicking on search Train button
   * @param {Array} trainslist
   */
  displayMovements(trainslist) {
    this._trainslist = trainslist;
    this.removeTrainDetailsMovements(); //(or).textContent=0
    trainslist.forEach((mov, index) => {
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
              <span class="train-time-destination">${Object.values(mov[2])[0]
        }</span>
              <br />
              </div>
              <div class="train-dates">
              <span class="Train-Start-date">
                <span class="train-timings">${mov[1].Time
        }</span> ${this.getDateFormat(mov[4][0])}</span
              >
              <span class="Train-End-date">
                <span class="train-timings">${mov[2].Time
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
        .insertAdjacentHTML("afterbegin", html);
    }
    );
  }

  /**
   * To perform AutoComplete feature for searching train source and destinations
   */
  AutoCompleteForFromANDTo() {
    let options = "";
    for (let i = 0; i < this._places.length; i++) {
      options += '<option value="' + this._places[i] + '" />';
    }
    document.getElementById("From").innerHTML = options;
    document.getElementById("To").innerHTML = options;
  }

  /**
   * To Handle Search button click function, by clicking search button trains lists will be display based 
   * on the source and distination entered by passenger
   * @param {method} handler
   */
  bindSearchTrainsButton(handler) {
    this._searchButton.addEventListener("click", (event) => {
      event.preventDefault();
      if (
        !this._source.value ||
        !this._destination.value ||
        !this._date.value
      ) {
        alert("Please enter all fields");
        this.removeTrainDetailsMovements();
      } else {

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

  /**
   * To check if user clicked on Available seats button
   * @param {method} handler
   * @returns {htmlElement}
   */
  bindAvailableSeatsClick(handler) {
    this._helperHandler = handler;
    this.getModel1Elements();
    document.querySelectorAll(".Available-seats").forEach((ele) => {
      if (
        ele.textContent.trim() != "TRAIN DEPARTED" &&
        ele.textContent.trim() != "NOT AVAILABLE"
      ) {
        ele.addEventListener("click", (event) => {
          ele.style.backgroundColor = "#a9b6af";
          event.preventDefault();
          this._modal1.classList.remove("hidden");

          /* SetTimeOut method is open for user for 10 sec time period to select number of passengers. 
           After that time it will close automatically*/
          /* this._stopTimeOut=setTimeout(()=>{
            this._modal1.classList.add("hidden");
            this._overlay[0].classList.add("hidden");
          },10000) */


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

  /**
   * To close Model-1(ticket booking) window
   */
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
      //To reset Number of passengers field value
      this.resetPassengerNumberfield();
    });
  }

  /**
   * To select number of passengers
   * @param {method} handler
   */
  bindSelectPassengers(handler) {
    this.getModel1Elements();
    this._passengerNo.addEventListener("change", (event) => {

      //To clear SetTimeout method
      /* clearTimeout(this._stopTimeOut);
      this._modal1.classList.remove("hidden");
      this._overlay[0].classList.remove("hidden"); */

      event.preventDefault();
      this.helperToResetNoOfpassengerFeilds(event);
      const value = event.target.value;
      this.addPassengersDetailsFields(value, handler);
    });
  }

  /**
   * To reset number of passengers, if user changes no. of passengers feild
   */
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

  //To reset passenger number field
  resetPassengerNumberfield() {
    this._passengerNo.value = "Select number of passengers";
    document.querySelector(".Confirm_Booking").classList.add("hidden");
    this.helperToResetNoOfpassengerFeilds();
  }


  /**
   * To Handle no. of passengers given by user like 1, 2, 3 or 4 and 4 is the maximum limit
   * @param {number} value
   * @param {method} handler
    */
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
    for (let i = 1; i <= 4; i++) {
      let val = [...document.querySelector(`.Passenger-${i}`).elements];
      val.forEach((ele, index) => {
        ele.removeAttribute('readonly');
        if (index === 2 || index === 3) {
          ele.disabled = false;
        }
      });
    }

    this.OnlickAddPassenger(handler);
  }

  /**
   * To Handle adding passengers details to book tickets
   * @param {method} handler
   * @returns {method}
   */
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

  /**
   * To Handle passengers details entered by user
   * @param {Array} value
   * @param {method} handler
   * @param {DOMElement} clickElement
   * @returns {Array}
   */
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
        let userInputCheck = 0;
        //To check duplicate passenger details for same PNR
        if (this._passengerdetails.length !== 0) {
          this._passengerdetails[this._passengerdetails.length - 1].forEach((ele, index) => {
            if (index < 3 && ele.toLowerCase() === val[index].toLowerCase()) {
              userInputCheck = userInputCheck + 1;
            }
          });
        }
        if (userInputCheck === 3) {
          alert("Failed to add passenger. Passenger with same details already exists");
          elements.forEach((ele, index) => {
            ele.value = "";
            if (index === 2) { ele.value = "Gender"; }
            if (index === 3) { ele.value = "Berth type"; }
          })
          elements[elements.length - 1].value = "Add Passenger";
        }
        else {
          this._passengerdetails.push(val);
          elements[elements.length - 1].value = "Added Passenger";
          clickElement.target.style.backgroundColor = "#1475cf";
          clickElement.target.style.pointerEvents = "none";
          elements.forEach((ele, index) => {
            ele.setAttribute('readonly', true);
            if (index === 2 || index === 3)
              ele.disabled = true;
          })

          document.querySelector(".Confirm_Booking").classList.remove("hidden");
          this.OnclickConfirmBooking(handler);
        }
      }
    }

    //Before clicking "confirm booking button" if User changes no.of passengers or close the model window
    this.bindSelectPassengers(handler);
    this.bindModelWindow1Close();
  }

  /**
   * To Validate entered passengers details like no blank spaces before or after the value and
   * valiation for age like placed limit as 5-100 years and for phone number it should be 10 digit
   * @param {string} ele
   * @param {string} val
   * @param {number} index
   * @returns {boolean}
   */
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

  /**
   * To Handle Confirm Booking button, stop immediate propagation of process
   * @param {method} handler
   */
  OnclickConfirmBooking(handler) {
    document
      .querySelector(".Confirm_Booking")
      .addEventListener("click", (event) => {
        event.stopImmediatePropagation();
        console.log(this._passengerdetails);
        handler(this._passengerdetails);
      });
  }


  /**
   * Get method to get Available seats after checking with Current Avaiable seats from the dataBase
   * @param {htmlElement} movementSelected
   * @param {Array} trainsFoundlist
  */
   getAvailableSeatsNumber(movementSelected,trainsFoundlist) {
    let trainNumber=movementSelected.querySelector(".movements__type--train").textContent.replace(/\s+/g, "").split("(")[1].split(")")[0];
    let Bdate=movementSelected.querySelector(".Train-Start-date").textContent;
    let d=new Date(Bdate.trimStart().trimEnd().slice(9));
    console.log(Bdate,d);
    let date=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().split("T")[0];
    trainsFoundlist.forEach((ele,index)=>{
      if(trainNumber=== ele[0].train_number){
          ele[1].Date.forEach((e,i)=>{
            if(e===date){
               movementSelected.querySelector(".Available-seats").textContent=ele[1].Available_Seat[i];
            }
          })
      }   
    });
   
    return movementSelected
      .querySelector(".Available-seats")
      .textContent.replace(/\s+/g, "");
  }

  /**
   * To display booking ticket completion window with PNR numbers
   * @param {string} pnrNumber
   */
  showBookingCompletedWindowWithPNRNumber(pnrNumber) {
    document.querySelector(".PNR").textContent = pnrNumber;
    document.querySelector(".passengers").classList.add("hidden");
    document
      .querySelector(".Book-ticket-section-heading")
      .classList.add("hidden");
    document.querySelector(".Booking_done").classList.remove("hidden");
  }

  /**
   * Description
   * @param {htmlElement} movements
   * @returns {htmlElement}
   */
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

  /**
   * To get ticket and passenger details with entered PNR number
   * @param {method} handler
   */
  bindpnrsearch(handler) {
    this._pnrsearchButton.addEventListener("click", (event) => {
      event.preventDefault();
      if (!this._pnrnumber.value) {
        alert("PNR number can't be Null.Please enter PNR number");
      } else if (this._pnrnumber.value.length !== 10) {
        alert("Please enter valid 10 digit PNR number");
      } else {
        handler(this._pnrnumber.value.trimStart().trimEnd());
        this._pnrnumber.value = "";
      }
    });
  }

  /**
   * To get PNR Model Window 
   */
  getModelpnrElements() {
    this._overlay1 = document.querySelectorAll(".overlay");
    this._openButton2 = document.querySelectorAll("#form__btn--PNR");
    this._closeButtonpnr = document.querySelectorAll(".close-modal1");
    this._modalPNR = document.querySelector(".modal2-PNR-details");
    this._PNRNumber = document.querySelector(".PNR-no");
    this._PNRTrainNameNumber = document.querySelector(".PNR-Train-name-number");
    this._PNRSource = document.querySelector(".PNR-source");
    this._PNRDestination = document.querySelector(".PNR-destination");
    this._PNRDateofjourneyTime = document.querySelector(".PNR-dateofjourney-time");
  }

  /**
   * To Get PNR Model window with matched ticket details
   * @param {Array} pnrnumberFoundlist
   */
  bindModelWindowpnr(pnrnumberFoundlist) {
    this.getModelpnrElements();
    this._overlay1[1].classList.remove("hidden1");
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

  /**
   * To Close PNR Model window on click of close button
   */
  bindModelPNRWindowClose() {
    this.getModelpnrElements();
    this._closeButtonpnr[1].addEventListener("click", (event) => {
      event.preventDefault();
      this._modalPNR.classList.add("hidden1");
      this._overlay1[1].classList.add("hidden1");
    });
  }

  /**
   * To Handle Cancellation on click of Cancel Ticket button
   * @param {method} handler
   */
  bindpnrCancelsearch(handler) {
    this._pnrCancelsearchButton.addEventListener("click", (event) => {
      event.preventDefault();
      if (!this._pnrCancelnumber.value) {
        alert("PNR number can't be Null. Please enter PNR number");
      } else if (this._pnrCancelnumber.value.length !== 10) {
        alert("Please enter valid 10 digit PNR number");
      } else {
        handler(this._pnrCancelnumber.value.trimStart().trimEnd());
        this._pnrCancelnumber.value = "";
      }
    });
  }

  /**
   * To Get PNR Cancel model elements
   */
  getModelpnrCancelElements() {
    this._overlay2 = document.querySelectorAll(".overlay");
    this._openButtonCancel2 = document.querySelectorAll("#form__btn--Cancel-PNR");
    this._closeButtonpnrCancel = document.querySelectorAll(".close-modal1");
    this._modalPNRCancel = document.querySelector(".modal3");
    this._PNRNumber = document.querySelector(".PNR-no1");
    this._PNRTrainNameNumber = document.querySelector(".PNR-Train-name1");
    this._PNRSource = document.querySelector(".PNR-source1");
    this._PNRDestination = document.querySelector(".PNR-destination1");
    this._PNRDateofjourneyTime = document.querySelector(".PNR-dateofjourney1");
  }

  /**
   * To Handle PNR Cancel  number matched Ticket list
   * @param {Array} pnrnumberFoundlist
   */
  bindModelWindowpnrCancel(pnrnumberFoundlist) {
    this.getModelpnrCancelElements();
    this._overlay2[2].classList.remove("hidden2");
    this._PNRNumber.textContent = pnrnumberFoundlist[0].pnrnumber;
    this._PNRTrainNameNumber.textContent = pnrnumberFoundlist[0].trainname;
    this._PNRSource.textContent = pnrnumberFoundlist[0].source;
    this._PNRDestination.textContent = pnrnumberFoundlist[0].destination;
    this._PNRDateofjourneyTime.textContent = pnrnumberFoundlist[0].sourcedatetime;
    document.querySelector(".table-body-cancel").innerHTML = "";
    pnrnumberFoundlist.forEach((ele, index) => {
      if (ele.passengerstatus === "WL") {
        ele.passengerseat = "NA";
        ele.passengerstatus = ele.passengerseatnumber;
        ele.passengerseatnumber = "NA";
      }

      const html = `<tr class= "test${index + 1}">
              <td><input class="checked hidden" type="checkbox"/> Passenger-${index + 1
        }</td>
              <td class="Pname">${ele.passengername}</td>
              <td>${ele.passengerage}</td>
              <td>${ele.passengergender}</td>
              <td class="status">${ele.passengerstatus}</td>
              <td>${ele.passengerseat}</td>
              <td>${ele.passengerseatnumber}</td>
            </tr>`;
      document
        .querySelector(".table-body-cancel")
        .insertAdjacentHTML("beforeend", html);
      if (ele.passengerstatus !== "Cancelled") {
        document.querySelectorAll(".checked")[index].classList.remove("hidden");
      }
    });
    this._modalPNRCancel.classList.remove("hidden2");
    this.bindCheckedPassengerData(pnrnumberFoundlist[0].pnrnumber);
  }

  /**
   * To Get searched passenger and ticket data
   * @param {string} pnrnumber
   */
  bindCheckedPassengerData(pnrnumber) {
    this._pnrnumberCancel = pnrnumber;
    this._pnrcancelData = [];
    document.querySelectorAll(".checked").forEach((ele, index) => {
      ele.addEventListener("change", (e) => {
        if (e.target.checked) {
          let getSiblings = (node) =>
            [...node.children].filter((c) => c !== node);
          let siblingsToC = getSiblings(
            document.querySelector(`.test${index + 1}`)
          );
          this._pnrcancelData.push([this._pnrnumberCancel,
          siblingsToC[5].textContent,
          siblingsToC[1].textContent,
          this._CancelSeatNo,
          siblingsToC[6].textContent])
        }

        //To remove passenger details of status checked to unchecked
        else {
          let getSiblings = (node) =>
            [...node.children].filter((c) => c !== node);
          let siblingsToC = getSiblings(
            document.querySelector(`.test${index + 1}`)
          );
          this._pnrcancelData.forEach((ele, index) => {
            if (ele[2] === siblingsToC[1].textContent) {
              this._pnrcancelData.splice(index, index + 1);   //remove the unchecked passenger details    
            }
          })
        }
      });
    });
  }

  /**
   * To Handle on click event of confirm button
   * @param {method} handler
   */
  bindConfirmCancel(handler) {
    let status = false;
    document.querySelector(".btn_confirm").addEventListener("click", (e) => {
      e.preventDefault();
      this._cancelconformStatus = true;
      this._pnrcancelData.forEach((ele, index) => {
        ele[4] = "Cancelled";
        ele[1] = "NA";
        ele[3] = "NA";
        handler(...this._pnrcancelData[index]);
      })
      this._modalPNRCancel.classList.add("hidden2");
      this._overlay2[2].classList.add("hidden2");
    });
  }

  /**
   * To Close PNR Cancellation window
   */
  bindModelPNRCancelWindowClose() {
    this.getModelpnrCancelElements();
    this._closeButtonpnrCancel[2].addEventListener("click", (event) => {
      event.preventDefault();
      this._modalPNRCancel.classList.add("hidden2");
      this._overlay2[2].classList.add("hidden2");
    });

  }
}

export default new View();                              //Exporting View class object