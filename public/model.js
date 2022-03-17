//import Swal from 'sweetalert2/dist/sweetalert2.js';

//Swal("Hi");

/** Model Class for HTTP calls,database connection and data manipulation.*/
class Model {
  /**
   *  Private variables declaration
   */
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
  constructor() {}

/**
 * To get train details by junction index
 * @param {number} index
 * @returns {Array}
 */
 getTrainDetailsByJunctionIndex(index) {
    return this._trainsDetails[index];
  }

/**
 * To get train Junctions by using map method
 */
  getJunctions() {
    this._trainJunctions = this._trainsDetails.map(
      (item, index) => item["junctions"]
    );
    //console.log(this._trainJunctions);
  }

/**
 * To get Junction Stations by its Index
 * @param {number} index1
 * @param {number} index2
 * @returns {Array}
 */
 getJunctionStationsByIndex(index1, index2) {
    return this._trainJunctions[index1][index2];
  }

/**
 * To get train start,end dates and available seats of a train
 * @param {number} i1
 * @param {number} i2
 * @param {number} i3
 * @param {number} dateIndex
 * @returns Array of strings
 */
  getTrainStartAndEndDateAvailableSeats(i1, i2, i3, dateIndex) {
    let source = this.getJunctionStationsByIndex(i1, i2);
    let destination = this.getJunctionStationsByIndex(i1, i3);
    return [
      source["Date"][dateIndex],
      destination["Date"][dateIndex],
      source["Available_Seat"][dateIndex],
    ];
  }

/**
 * To calculate time difference between start and end time of a train
 * @param {string} start
 * @param {string} end
 * @returns {string} 
 */
  CalculateTimeDifference(start, end) {
    let t1parts = start.Time.split(":");
    let t1cm = Number(t1parts[0]) * 60 + Number(t1parts[1]);

    let t2parts = end.Time.split(":");
    let t2cm = Number(t2parts[0]) * 60 + Number(t2parts[1]);

    let hour = Math.floor((t1cm - t2cm) / 60);
    let min = Math.floor((t1cm - t2cm) % 60);
    return Math.abs(hour) + "h " + Math.abs(min) + "m";
  }

/**
 * To searh user entered date with the available train dates. 
 * @param {Array} date1
 * @param {string} date2
 * @returns {string | boolean} The i is found date and bolean is status whether date is found or not.
 */
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

/**
 * To compare train time with current time
 * @param {string} date
 * @param {string} time1
 * @returns {string} The train state status
 */
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

/**
 * To convert user entered station and train stations to lower case. To find if searched station contains in the trains station points. 
 * @param {string} value1
 * @param {string} value2
 * @returns {boolean} The station found status
 */
  TrainStationsToCovertTolowerCaseAndCompare(value1, value2) {
    value1 = value1 + "";
    value2 = value2 + "";
    if (value1.toLowerCase() === value2.toLowerCase()) return true;
    else return false;
  }

/**
 * To search trains by user entered fields source,destination and date. 
 * @param {string} source
 * @param {string} destination
 * @param {string} date
 * @returns {Array} The trains found list and status
 */
  searchTrain(source, destination, date) {
    let status = false; //To check if train is found are not false=NOT found
    let trainsFound = [];
    let timediff;
    /*index1 is index of matched junctions point. index2 is index of matched source station,
     index3 is index of matched destination station */
    this._trainJunctions.forEach((res1, index1) => {
      res1.forEach((res2, index2) => {
        if (
          this.TrainStationsToCovertTolowerCaseAndCompare(
            res2[`Station-${index2 + 1}`],
            source
          ) === true &&
          this.searchDate(res2["Date"], date)[1] === true
        ) {
          this._trainJunctions[index1].forEach((des, index3) => {
            //To check source index is less than destination index
            if (
              this.TrainStationsToCovertTolowerCaseAndCompare(
                des[`Station-${index3 + 1}`],
                destination
              ) === true &&
              index2 < index3
            ) {
              this.CompareTrainTimeWithCurrentTime(date, res2["Time"]);
              status = true;
              timediff = this.CalculateTimeDifference(
                this.getJunctionStationsByIndex(index1, index2),
                this.getJunctionStationsByIndex(index1, index3)
              );

              //Pushing the found train details into an array
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

    return [trainsFound, status];
  }

/**
 * Fetching the trains data from the specified URL "http://localhost:4500/trainsDetails".
 * @async
 * @param {string} source
 * @param {string} destination
 * @param {string} date
 * @returns {Array} The trains found list and status
 */
  async getTrainsDetails(source, destination, date) {
    const req = await fetch(`http://localhost:4500/trainsDetails`);
    this._trainsDetails=await req.json();

    //console.log(this._trainsDetails);
    this.getJunctions();
     return this.searchTrain(source, destination, date);
   }
 

/**
 * To update avialiable seats fields in Mongodb database by using POST method.  
 * @param {Array} traindata
 * @param {string} UpdatedSeats
 */
  updateJSONWithUpdatedAvailableSeats(traindata, UpdatedSeats) {
    console.log(traindata,UpdatedSeats);
    let trainName=traindata[0].split("(")[0].trimEnd();
    /* let station =traindata[1];
    let date=new Date(traindata[2].slice(8)); */
    for (let i = 0; i < this._trainsDetails.length; i++) {
      if (this._trainsDetails[i].train_name === traindata[0].split("(")[0].trimEnd()) {
        this._trainsDetails[i]["junctions"].forEach((s, k) => {
          if (s[`Station-${k + 1}`] === traindata[1]) {
            let d = new Date(traindata[2].slice(8));
            let date = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
              .toISOString()
              .split("T")[0];
            s["Date"].forEach(async (d, j) => {
              if (d === date) {
                //this._trainsDetails[i]["junctions"][k]["Available_Seat"][j];
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

/**
 * To send data of booked ticket details into MYSQL database.
 * @param {Array} BookedPassengersdata contains booked passenger details
 */
  storeDataOfBookedTicketIntoDataBase(BookedPassengersdata) {
    let passengerdetails = [];
    let [pnr_number] = BookedPassengersdata.splice(-2, 1);
    BookedPassengersdata.forEach((el, index) => {
      if (index != BookedPassengersdata.length - 1) {
        passengerdetails.push(el);
      }
    });
    //calling a method to send train details data
    this.sendBookedTrainDataToDatabase(pnr_number,BookedPassengersdata[BookedPassengersdata.length - 1]);
    passengerdetails.forEach((ele, index) => {
      //calling a method to send passenger details data
      this.sendBookedPassengerDataToDatabase(
        ele,
        pnr_number,
      );
    });
  }


/**
 * To send booked train Data into MYSQL Database using POST method
 * @param {string} pnrnumber the 10 digit PNR number
 * @param {Array} traindata
 */
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
    
/**
 * To send Booked paasenger Data into MYSQL Database using POST method
 * @async
 * @param {Array} ele
 * @param {string} pnrnumber
 */
    async sendBookedPassengerDataToDatabase(ele, pnrnumber) {
    //console.log(ele[4]);
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

/**
 * To get PNR details from dataBase by PNR number using GET method
 * @async
 * @param {string} pnrnumber
 * @returns {Array} The found PNR number details
 */
  async setEditModal(pnrnumber) {
    // Get information about the booking using PNR Number
    const req = await fetch(
      `http://localhost:4500/bookedpassengersdata/${pnrnumber}`
    );
    this._FoundPnr = await req.json();
    //console.log(this._FoundPnr);
    return this._FoundPnr;
  }

/**
 * To get stored data of booked ticket from DataBase by PNR number
 * a@async
 * @param {string} pnrnumber
 * @returns {Array | boolean} The found PNR details and found status
 */
  async getstoreDataOfBookedTicketFromDataBase(pnrnumber) {
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

/**
 * To store data of cancelled ticket into DataBase using PUT method
 * @async
 * @param {string} pnrnumberCancel
 * @param {string} CancelBerth
 * @param {string} CancelName
 * @param {string} CancelSeatNo
 * @param {string} CancelStatus
 */
  async storeDataOfCancelledTicketIntoDataBase(pnrnumberCancel,CancelBerth,CancelName,CancelSeatNo,CancelStatus) {
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

export default new Model();                                 //Exporting Model class object
