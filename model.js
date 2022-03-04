import { async } from "regenerator-runtime";
import * as data from "./trainList.json";
class Model {
  _trainsDetails = "";
  _trainJunctions = "";
  _trainDates = "";
  _trainStations = "";
  _trainTime = "";
  _trainAvlSeats = "";
  _currentTime = "";
  _currentDate = "";
  constructor() {
    //this.sql = sql;
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

  getTrainStartAndEndDateAvailableSeats(i1, i2, i3, dateIndex) {
    let source = this.getJunctionStationsByIndex(i1, i2);
    let destination = this.getJunctionStationsByIndex(i1, i3);
    return [
      source["Date"][dateIndex],
      destination["Date"][dateIndex],
      source["Available_Seat"][dateIndex],
    ];
  }

  CalculateTimeDifference(start, end) {
    let t1parts = start.Time.split(":");
    let t1cm = Number(t1parts[0]) * 60 + Number(t1parts[1]);

    let t2parts = end.Time.split(":");
    let t2cm = Number(t2parts[0]) * 60 + Number(t2parts[1]);

    let hour = Math.floor((t1cm - t2cm) / 60);
    let min = Math.floor((t1cm - t2cm) % 60);
    return Math.abs(hour) + "h " + Math.abs(min) + "m";
  }

  searchDate(date1, date2) {
    let check = false;
    for (let i = 0; i < date1.length; i++) {
      if (date1[i] === date2) {
        check = true;
        return [i, true];
      }
    }
    if (check === false) return [false, false];
  }

  CompareTrainTimeWithCurrentTime(date, time1) {
    this._currentDate = new Date().toISOString().split("T")[0];
    if (date === this._currentDate) {
      // To check if the train start date is current date
      let t1parts = time1.split(":"); //train start time
      let t1cm = Number(t1parts[0]) * 60 + Number(t1parts[1]);

      let time2 = new Date().toLocaleTimeString("it-IT");
      let t2parts = time2.split(":"); //current time
      let t2cm = Number(t2parts[0]) * 60 + Number(t2parts[1]);

      let hour = Math.floor((t1cm - t2cm) / 60); //To get difference between train start time and current time

      if (time1 > time2) {
        //means train not yet started
        if (hour < 4 && hour >= 0) {
          //to check if time left for train to start is <= 4hr then we can't book tickets
          return "NOT AVAILABLE";
        }
        //return "Available";
      } else return "TRAIN DEPARTED"; //means train already started
    }
  }

  TrainStationsToCovertTolowerCaseAndCompare(value1, value2) {
    value1 = value1 + "";
    value2 = value2 + "";
    if (value1.toLowerCase() === value2.toLowerCase()) return true;
    else return false;
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
        if (
          this.TrainStationsToCovertTolowerCaseAndCompare(
            res2[`Station-${index2 + 1}`],
            source
          ) === true &&
          this.searchDate(res2["Date"], date)[1] === true
          //this.CompareTrainTimeWithCurrentTime(date, res2["Time"]) === true)
        ) {
          //console.log(source, date, index1, index2);
          this._trainJunctions[index1].forEach((des, index3) => {
            //To check source index is less than destination index
            if (
              this.TrainStationsToCovertTolowerCaseAndCompare(
                des[`Station-${index3 + 1}`],
                destination
              ) === true &&
              index2 < index3
            ) {
              //console.log(source, date, destination, index1, index2, index3);
              this.CompareTrainTimeWithCurrentTime(date, res2["Time"]);
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
                this.getTrainStartAndEndDateAvailableSeats(
                  index1,
                  index2,
                  index3,
                  this.searchDate(res2["Date"], date)[0]
                ),
                this.CompareTrainTimeWithCurrentTime(date, res2["Time"]),
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
    /* const res = await fetch(JSON);
      const data = await res.json(); */
    /* this._trainsDetails = JSON.stringify(data); */
    this._trainsDetails = data.default; //default store contains complete JSON data in array of objects format
    //console.log(data);
    this.getJunctions();
    this.getJunctionsDates();
    this.getJunctionsStations();
    this.getJunctionsTime();
    this.getJunctionsAvlSeats();

  }

  updateJSONWithUpdatedAvailableSeats(traindata, UpdatedSeats) {
    /*  const updateJsonFile = require("update-json-file");
    const filePath = "./trainList.json";
    const options = { defaultValue: {} };
    console.log(data);
    console.log(traindata, UpdatedSeats);
    updateJsonFile(
      filePath,
      (data) => { */

    for (let i = 0; i < data.default.length; i++) {
      if (data[i].train_name === traindata[0].split("(")[0].trimEnd()) {
        //console.log("entered1");
        // console.log(this._trainsDetails[i]["junctions"], traindata[1]);
        data[i]["junctions"].forEach((s, k) => {
          if (s[`Station-${k + 1}`] === traindata[1]) {
            //console.log("entered2");
            let d = new Date(traindata[2].slice(8));
            let date = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
              .toISOString()
              .split("T")[0];
            s["Date"].forEach((d, j) => {
              if (d === date) {
                /* console.log(
                  "entered3",
                  data.default[i]["junctions"][k]["Available_Seat"][j]
                ); */
                data[i]["junctions"][k]["Available_Seat"][j] = UpdatedSeats;
                //console.log(UpdatedSeats, data);      
              }
            });
          }
        });
      }
    }
    /* },
      options
    ); */
  }

  storeDataOfBookedTicketIntoDataBase(BookedPassengersdata) {
    console.log(BookedPassengersdata); //this contains booked passengers information
    //this.sql.SendingDataIntotable(BookedPassengersdata);
  }
}

export default new Model();
