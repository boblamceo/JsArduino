const five = require("johnny-five");
const tf = require("@tensorflow/tfjs-node");
let lcd;

let liveData = [];
let predictionDone = false;
let started = false;
let model;
const gestureClasses = ["violin", "punch"];

let numParametersRecorded = 11; // 14 values from Arduino;
let numLinesPerFile = 100;
let numValuesExpected = numParametersRecorded * numLinesPerFile;

const init = async () => {
    model = await tf.loadLayersModel("file://model/model.json");
};

const board = new five.Board({
    port: "COM14",
});

board.on("ready", function () {
    lcd = new five.LCD({
        pins: [7, 8, 9, 10, 11, 12],
        rows: 2,
        cols: 16,
    });
    console.log("Board ready!");
    const button = new five.Button({ pin: 2, invert: true });

    const imu = new five.IMU({
        controller: "MPU6050",
    });

    imu.on("data", function () {
        let dataAvailable = this.accelerometer.x;

        if (dataAvailable && !started) {
            console.log("imu ready");
        }

        button.on("hold", () => {
            predictionDone = false;
            let data = {
                xAcc: this.accelerometer.x,
                yAcc: this.accelerometer.y,
                zAcc: this.accelerometer.z,
                accPitch: this.accelerometer.pitch,
                accRoll: this.accelerometer.roll,
                acceleration: this.accelerometer.acceleration,
                inclination: this.accelerometer.inclination,
                orientation: this.accelerometer.orientation,
                xGyro: this.gyro.x,
                yGyro: this.gyro.y,
                zGyro: this.gyro.z,
            };

            if (liveData.length < numValuesExpected) {
                liveData.push(
                    data.xAcc,
                    data.yAcc,
                    data.zAcc,
                    data.accPitch,
                    data.accRoll,
                    data.acceleration,
                    data.inclination,
                    data.orientation,
                    data.xGyro,
                    data.yGyro,
                    data.zGyro
                );
            }
        });

        button.on("release", function () {
            if (!predictionDone && liveData.length) {
                predictionDone = true;
                predict(model, liveData);
                liveData = [];
            }
        });

        started = true;
    });
});

const predict = (model, newSampleData) => {
    tf.tidy(() => {
        const inputData = newSampleData;

        const input = tf.tensor2d([inputData], [1, numValuesExpected]);
        const predictOut = model.predict(input);
        const winner = gestureClasses[predictOut.argMax(-1).dataSync()[0]];

        lcd.clear();
        lcd.cursor(0, 0);
        lcd.print(winner);
        console.log(winner);
    });
};

init();

board.on("close", function () {
    console.log("Board disconnected");
});
