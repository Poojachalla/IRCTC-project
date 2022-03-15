import Model from "./model.js";
import View from "./view.js";

/**************** CLASS CONTROLLER  ******************/
class Controller {
  _updatedAvailableSeats;
  _trainBookedDetails;
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.view.AutoCompleteForFromANDTo();
    this.view.setDatefieldInBookingSection();
    this.view.bindSearchTrainsButton(this.handleSearchTrains);
    //this.view.bindpnrsearch(this.handlepnrsearch);
    this.view.bindpnrsearch(this.handlepnrsearch);
    this.view.bindpnrCancelsearch(this.handlepnrsearchCancel);
    this.view.bindConfirmCancel(this.getCancelPassengerData);
  }

  init() {
    //Check if Click action call done for inside events of modal1 Window
    this.view.bindSelectPassengers(this.handleSelectPassengers);
  }
  
  handleSearchTrains = (source, destination, date) => {
    [this._trainsFoundlist, this.status] = [
      ...this.model.getTrainsDetails(source, destination, date),
    ];

    //To check status whether trains are found or not
    if (this.status === false) {
      alert("No Trains Found");
      this.view.removeTrainDetailsMovements();
    } else {
      this.view.displayMovements(this._trainsFoundlist);

    }

    /* //For trains that are departed and trains that have <4 hr to reach the station
    this.view.RemoveOnclickForDepartedAndNotAvailableTrains(
      this._trainsFoundlist
    ); */

    //Click action call to open modal1 Window
    this.view.bindAvailableSeatsClick(this.handleAvailableSeatsClick);
    this.view.bindModelWindow1Close();
  };

  handleAvailableSeatsClick = (movementSelected) => {
    this._movementSelected = movementSelected;
    /* //Check if Click action call done for inside events of modal1 Window
      this.view.bindSelectPassengers(this.handleSelectPassengers); */
    this.init();
  };

  handleSelectPassengers = (value) => {
    console.log("Booked pasenger details:", value);
    //console.log("Booked train details:", this._movementSelected);
    this.generateSeatNumber(value, this._movementSelected);
    this.generateUniquePNR(value);

    //Update in Movements View also set in JSON File.
    this.view.updateUIWithUpdatedAvailableSeats(
      this._movementSelected,
      this._updatedAvailableSeats
    );

    //TO update avaialble seats of trains in JSON file
    this.model.updateJSONWithUpdatedAvailableSeats(
      this._trainBookedDetails,
      this._updatedAvailableSeats
    );
    //this.view.bindpnrsearch(this.handlepnrsearch);
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
        v.push(`SL${Number(avlSeats.slice(1))}`); //generating random seat number //{Math.floor(Math.random() * (99 - 1 + 1)) + 1}
        this._updatedAvailableSeats = `A${Number(avlSeats.slice(1)) - 1}`;
        avlSeats = this._updatedAvailableSeats;
      } else if (avlSeats.at(0) === "A" && Number(avlSeats.slice(1)) === 0) {
        this._updatedAvailableSeats = "W1";
        v.push("WL");
        v.push(`WL${Number(avlSeats.slice(1)) + 1}`);
        avlSeats = this._updatedAvailableSeats;
      } else {
        //if (avlSeats.at(0) === "W" && Number(avlSeats.slice(1) > 0)) {
        this._updatedAvailableSeats = `W${Number(avlSeats.slice(1)) + 1}`;
        v.push("WL");
        v.push(`WL${Number(avlSeats.slice(1)) + 1}`);
        avlSeats = this._updatedAvailableSeats;
      }
    });
    //console.log(value);
  }

  generateUniquePNR(value) {
    let Pnr = "";
    for (let i = 0; i < 5; i++) {
      Pnr += value[0][i].at(0);
    }
    Pnr += Math.floor(Math.random() * 90000) + 10000; //Generating random 5 digit number
    value.push(Pnr.toUpperCase());
    //console.log(value, this._movementSelected);

    //Store booked ticket details into dataBase
    this._trainBookedDetails = this.view.getTrainBookedDetails(
      this._movementSelected
    );
    console.log("Booked train details:", this._trainBookedDetails);
    value.push(this._trainBookedDetails); //this.view.getTrainBookedDetails(this._movementSelected)); //To push selected train details into value array
    this.view.showBookingCompletedWindowWithPNRNumber(Pnr.toUpperCase());
    console.log(value);
    this.model.storeDataOfBookedTicketIntoDataBase(value);
  }
  handlepnrsearch = async (pnrnumber) => {
    [this._pnrnumberlist, this._status] =
      await this.model.getstoreDataOfBookedTicketIntoDataBase(pnrnumber);
    //console.log(this._pnrnumberlist, this._status);

    //To check whether pnr number is found or not
    if (this._status === false) {
      alert("PNR Number not found");
      this.view._pnrnumber.value = "";
    } else {
      this.view.bindModelWindowpnr(this._pnrnumberlist);
    }
    this.view.bindModelPNRWindowClose();
  };

  //Cancellation
  handlepnrsearchCancel = async (pnrnumber) => {
    [this._pnrnumberlist, this._status] =
      await this.model.getstoreDataOfBookedTicketIntoDataBase(pnrnumber);

    //To check whether pnr number is found or not
    if (this._status === false) {
      alert("PNR Number not found");
      this.view._pnrCancelnumber.value = "";
    } else {
      this.view.bindModelWindowpnrCancel(this._pnrnumberlist);
    }
    this.view.bindModelPNRCancelWindowClose();
  };

  getCancelPassengerData=((
    pnrnumberCancel,
    CancelBerth,
    CancelName,
    CancelSeatNo,
    CancelStatus
  )=>{
    console.log(
      pnrnumberCancel,
      CancelBerth,
      CancelName,
      CancelSeatNo,
      CancelStatus
    );
    this.model.storeDataOfCancelledTicketIntoDataBase(pnrnumberCancel,
      CancelBerth,
      CancelName,
      CancelSeatNo,
      CancelStatus)
  });
}
const app = new Controller(Model, View);
