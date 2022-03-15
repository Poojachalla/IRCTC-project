//import * as data from "./trainList.json" assert { type: "json" };
class Model {
  _trainsDetails = "";
  _trainJunctions = "";
  _trainDates = "";
  _trainStations = "";
  _trainTime = "";
  _trainAvlSeats = "";
  _currentTime = "";
  _currentDate = "";
  _bookedpassengersdetails = "";
  _FoundPnr = "";
  _FoundPnrCancel = "";
  constructor() {
    //this.sql = sql;
    //setInterval(this.getJSONData.bind(this),1000);
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

    //console.log(this._trainDates);
  }

  getJunctionsStations() {
    this._trainStations = this._trainsDetails.map((item, index) =>
      item["junctions"].map((res, i) => res[`Station-${i + 1}`])
    ); //returns array of junctions stations of all trains
    //console.log(this._trainStations);

  }

  getJunctionStationsByIndex(index1, index2) {
    return this._trainJunctions[index1][index2];
  }

  getJunctionsTime() {
    this._trainTime = this._trainsDetails.map((item, index) =>
      item["junctions"].map((res, i) => res["Time"])
    );
   // console.log(this._trainTime); //returns array of junctions stations of all trains
  }

  getJunctionsAvlSeats() {
    this._trainAvlSeats = this._trainsDetails.map((item, index) =>
      item["junctions"].map((res, i) => res["Available_Seat"])
    );
    //console.log(this._trainAvlSeats);
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
   // setInterval(this.searchTrain(source, destination, date),1000);
    return this.searchTrain(source, destination, date);
  }

  async getJSONData() {
    /* const res = await fetch(JSON);
      const data = await res.json(); */
    /* this._trainsDetails = JSON.stringify(data); */
    //this._trainsDetails = this._trainsDetails; //default store contains complete JSON data in array of objects format
    //console.log(data);

    const req = await fetch(`http://localhost:4500/trainsDetails`);
    this._trainsDetails=await req.json();

    console.log(this._trainsDetails);
    this.getJunctions();
    this.getJunctionsDates();
    this.getJunctionsStations();
    this.getJunctionsTime();
    this.getJunctionsAvlSeats();
  }

  updateJSONWithUpdatedAvailableSeats(traindata, UpdatedSeats) {
    console.log(traindata,UpdatedSeats);
    let trainName=traindata[0].split("(")[0].trimEnd();
    let station =traindata[1];
    let date=new Date(traindata[2].slice(8));
    for (let i = 0; i < this._trainsDetails.length; i++) {
      if (this._trainsDetails[i].train_name === traindata[0].split("(")[0].trimEnd()) {
        this._trainsDetails[i]["junctions"].forEach((s, k) => {
          if (s[`Station-${k + 1}`] === traindata[1]) {
            //console.log("entered2");
            let d = new Date(traindata[2].slice(8));
            let date = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
              .toISOString()
              .split("T")[0];
            s["Date"].forEach(async (d, j) => {
              if (d === date) {
                let place =
                  this._trainsDetails[i]["junctions"][k]["Available_Seat"][j];
                //this._trainsDetails[i]["junctions"][k]["Available_Seat"][j] = UpdatedSeats;
                //console.log(i,k,j,place,traindata[2].slice(0,8));
                const rawResponse = await fetch(`/trainsDetails/${trainName}`, {
                  method: "POST",

                  body: JSON.stringify({
                    trainName:traindata[0].split("(")[0].trimEnd(),
                    StationIndex: k,
                    dateIndex:j,
                    UpdatedSeats: UpdatedSeats,
                    time:traindata[2].slice(0,8)
                  }),

                  headers: {
                    "Content-Type": "application/json",
                  },
                });

                const content = await rawResponse.json();
              }
            });
          }
        });
      }
    }
  }

  storeDataOfBookedTicketIntoDataBase(BookedPassengersdata) {
    //console.log(BookedPassengersdata); //this contains booked passengers information
    let passengerdetails = [];
    let [pnr_number] = BookedPassengersdata.splice(-2, 1);
    BookedPassengersdata.forEach((el, index) => {
      if (index != BookedPassengersdata.length - 1) {
        passengerdetails.push(el);
      }
    });
    this.sendBookedTrainDataToDatabase(pnr_number,BookedPassengersdata[BookedPassengersdata.length - 1]);
    passengerdetails.forEach((ele, index) => {
      this.sendBookedPassengerDataToDatabase(
        ele,
        pnr_number,
      );
    });
  }


  //To send Booked TrainData into Database
  async sendBookedTrainDataToDatabase(pnrnumber, traindata) {
    const rawResponse = await fetch("/bookedTraindata", {
      method: "POST",
      body: JSON.stringify({
        pnrnumber1: pnrnumber,
        trainname: traindata[0],
        source: traindata[1],
        sourcedatetime: traindata[2],
        destination: traindata[3],
        destinationdatetime: traindata[4],
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const content = await rawResponse.json();
  }
    
    //To send Booked paasenger Data into Database
    async sendBookedPassengerDataToDatabase(ele, pnrnumber) {
    const rawResponse = await fetch("/bookedpassengersdata", {
      method: "POST",
      body: JSON.stringify({
        pnrnumber1: pnrnumber,
        passengername: ele[0],
        passengerage: ele[1],
        passengergender: ele[2],
        passengerseat: ele[3],
        passengerstatus: ele[5],
        passengerseatnumber: ele[6],
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const content = await rawResponse.json();
  }

  async setEditModal(pnrnumber) {
    // Get information about the booking using PNR Number
    const req = await fetch(
      `http://localhost:4500/bookedpassengersdata/${pnrnumber}`
    );
    this._FoundPnr = await req.json();
    //console.log(this._FoundPnr);
    return this._FoundPnr;
  }

  async getstoreDataOfBookedTicketIntoDataBase(pnrnumber) {
    let status = false; //To check if pnr number  is found are not false=NOT found
    let pnrfound1 = await this.setEditModal(pnrnumber);
    //console.log(pnrfound1);
    if (pnrfound1.length === 0) {
      status = false;
    } else {
      status = true;
    }
    return [pnrfound1, status];
  }

  //Cancellation

  async storeDataOfCancelledTicketIntoDataBase(pnrnumberCancel,
    CancelBerth,
    CancelName,
    CancelSeatNo,
    CancelStatus) {
    /* console.log(pnrnumberCancel,
      CancelBerth,
      CancelName,
      CancelSeatNo,
      CancelStatus); */

    const rawResponse = await fetch(
      `http://localhost:4500/bookedpassengersdata/${pnrnumberCancel}`,
      {
        method: "PUT",
        body: JSON.stringify({
          pnrnumber:pnrnumberCancel,
          CancelBerth:CancelBerth,
          CancelName:CancelName,
          CancelSeatNo:CancelSeatNo,
          CancelStatus:CancelStatus
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const content = await rawResponse.json();
  }

}

export default new Model();
