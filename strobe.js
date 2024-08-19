const { Board, IMU, Button } = require("johnny-five");
const board = new Board({ port: "COM14" });
const fs = require("fs");
let sampleNumber = 0;
let recording = false;

board.on("ready", () => {
    const button = new Button(2);
    const imu = new IMU({
        controller: "MPU6050",
    });
    let stream = fs.createWriteStream(`data/sample_punch_0.txt`, {
        flags: "a",
    });
    imu.on("data", function () {
        stream.write("hi");
        let data = `${this.accelerometer.x} ${this.accelerometer.y} ${this.accelerometer.z} ${this.accelerometer.pitch} ${this.accelerometer.roll} ${this.accelerometer.acceleration} ${this.accelerometer.inclination} ${this.accelerometer.orientation} ${this.gyro.x} ${this.gyro.y} ${this.gyro.z}`;
        button.on("down", function () {
            recording = true;
            stream.write("hi");
            if (sampleNumber < 30) {
                stream.write(`${data}\r\n`);
            }
        });
    });
    button.on("up", function () {
        recording = false;
        // stream.end();
        sampleNumber += 1;
    });
});
