const five = require("johnny-five");
const fs = require("fs");

let gestureType;
let stream, sampleNumber;
let previousSampleNumber;
let linesCounter;

const board = new five.Board({ port: "COM14" });
board.on("ready", function () {
    console.log("Board ready!");
    const button = new five.Button({ pin: 2, invert: true });

    process.argv.forEach(function (val, index, array) {
        gestureType = array[2];
        sampleNumber = parseInt(array[3]);
        previousSampleNumber = sampleNumber;
    });

    stream = fs.createWriteStream(
        `data/sample_${gestureType}_${sampleNumber}.txt`,
        { flags: "a" }
    );

    const imu = new five.IMU({
        controller: "MPU6050",
    });

    imu.on("data", function () {
        let data = `${this.accelerometer.x} ${this.accelerometer.y} ${this.accelerometer.z} ${this.accelerometer.pitch} ${this.accelerometer.roll} ${this.accelerometer.acceleration} ${this.accelerometer.inclination} ${this.accelerometer.orientation} ${this.gyro.x} ${this.gyro.y} ${this.gyro.z}`;

        button.on("hold", function () {
            console.log("record now");
            if (sampleNumber !== previousSampleNumber) {
                stream = fs.createWriteStream(
                    `./data/sample_${gestureType}_${sampleNumber}.txt`,
                    { flags: "a" }
                );
            }
            if (linesCounter < 100) {
                stream.write(`${data}\r\n`);
                linesCounter += 1;
            }
        });
    });

    button.on("release", function () {
        stream.end();
        sampleNumber += 1;
        linesCounter = 0;
    });
});

board.on("close", function () {
    console.log("Board disconnected");
});
