import { async } from "regenerator-runtime";
import * as data from "./trainList.json";
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
    this._trainJunctions = this._trainsDetails.map(
      (item, index) => item["junctions"]
    );
    console.log(this._trainJunctions);
  }

  getJunctionsDates() {
    this._trainDates = this._trainsDetails.map((item, index) =>
      item["junctions"].map((res) => res["Date"])
    ); //returns array of junctions dates of all trains

    console.log(this._trainDates);
  }

  getJunctionsStations() {
    this._trainStations = this._trainsDetails.map((item, index) =>
      item["junctions"].map((res, i) => res[`Station-${i + 1}`])
    ); //returns array of junctions stations of all trains
    console.log(this._trainStations);

    /* console.log(this.getJunctionStationsByIndex(3, 5)); */
  }

  getJunctionStationsByIndex(index1, index2) {
    return this._trainJunctions[index1][index2];
  }

  getJunctionsTime() {
    this._trainTime = this._trainsDetails.map((item, index) =>
      item["junctions"].map((res, i) => res["Time"])
    );
    console.log(this._trainTime); //returns array of junctions stations of all trains
  }

  getJunctionsAvlSeats() {
    this._trainAvlSeats = this._trainsDetails.map((item, index) =>
      item["junctions"].map((res, i) => res["Available_Seat"])
    );
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

  getJSONData() {
    try {
      /* const res = await fetch(JSON);
      const data = await res.json(); */
      /* this._trainsDetails = JSON.stringify(data); */
      this._trainsDetails = data.default; //deafult store complete JSOn data in array of objects format
      console.log(this._trainsDetails);
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

export default new Model();
