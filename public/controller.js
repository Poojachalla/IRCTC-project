import Model from "./model.js";
import View from "./view.js";

/**************** CLASS CONTROLLER  ******************/
class Controller {
  _updatedAvailableSeats;
  _trainBookedDetails;
  _myInterval;
  constructor(model, view) {
    this.model = model;                                           //Model class object
    this.view = view;                                             //View calss object
    this.view.AutoCompleteForFromANDTo();                         //Method for autoComplete feature 
    this.view.setDatefieldInBookingSection();                     //Setting calender element min and value fields to current date
    this.view.bindSearchTrainsButton(this.handleSearchTrains);    //To handle click operation on search trains button 
    this.view.bindpnrsearch(this.handlepnrsearch);                //To handle click operation on pnr search button 
    this.view.bindpnrCancelsearch(this.handlepnrsearchCancel);    //To handle click operation on pnr cancel button
    this.view.bindConfirmCancel(this.getCancelPassengerData);     //To handle click operation on confirm cancel button
  }

  init() {
    //Check if Click action call done for inside events of modal1 Window
    this.view.bindSelectPassengers(this.handleSelectPassengers);
  }
  

  //handler method for search trains button
 handleSearchTrains = async(source, destination, date) => {
  clearInterval(this.myInterval);
    [this._trainsFoundlist, this.status] = await this.model.getTrainsDetails(source, destination, date);
  
    //To check status whether trains are found or not
    if (this.status === false) {
      alert("No Trains Found");
      this.view.removeTrainDetailsMovements();
    } else {
      this.view.displayMovements(this._trainsFoundlist);

      //setinterval to fetch avialable seats of trains for every 10 sec 
      this.myInterval=setInterval(async()=>{
        [this._trainsFoundlist, this.status] = await this.model.getTrainsDetails(source, destination, date);
        this.view.displayMovements(this._trainsFoundlist);
        this.view.bindAvailableSeatsClick(this.handleAvailableSeatsClick);
        this.view.bindModelWindow1Close();
      },5000);
    }

    //Click action call to open modal1 Window
    this.view.bindAvailableSeatsClick(this.handleAvailableSeatsClick);
    this.view.bindModelWindow1Close();

  };

  //handler method for AvailableSeats button
  handleAvailableSeatsClick = (movementSelected) => {
    this._movementSelected = movementSelected;
    //Check if Click action call done for inside events of modal1 Window
    this.init();
  };

  //handler method for select passengers input
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

    //To update avaialble seats of trains in JSON file
    this.model.updateJSONWithUpdatedAvailableSeats(
      this._trainBookedDetails,
      this._updatedAvailableSeats
    );
    //this.view.bindpnrsearch(this.handlepnrsearch);
  };

  //Get method to get AvailableSeats
  getAvailableSeatsNumber(movementSelected) {
    let val = movementSelected
      .querySelector(".Available-seats")
      .textContent.replace(/\s+/g, "");
    return val.slice(val.indexOf(":") + 1);
  }

  //To generate unique Seat Number
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


  //To generate unique 10 digit PNR number
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

  //handler method for PNR search button
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

  //handler method for PNR search cancellation button
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

  //To send cancelled passenger data to MYSQL database
  getCancelPassengerData=((
    pnrnumberCancel,
    CancelBerth,
    CancelName,
    CancelSeatNo,
    CancelStatus
  )=>{
    /* console.log(
      pnrnumberCancel,
      CancelBerth,
      CancelName,
      CancelSeatNo,
      CancelStatus
    ); */
    this.model.storeDataOfCancelledTicketIntoDataBase(pnrnumberCancel,
      CancelBerth,
      CancelName,
      CancelSeatNo,
      CancelStatus)
  });
}

const app = new Controller(Model, View);

//setInterval(app.handleSearchTrains(app.source, app.destination, app.date),100);