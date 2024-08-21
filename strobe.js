const { Board, IMU } = require("johnny-five");
const board = new Board({ port: "COM14" });
const fs = require("fs");
board.on("ready", () => {
    const imu = new IMU({
        controller: "MPU6050",
    });
    let stream = fs.createWriteStream(`data/sample_punch_0.txt`, {
        flags: "a",
    });
    console.log("hi");
    imu.on("data", function () {
        console.log("hi");
        let data = `${this.accelerometer.x} ${this.accelerometer.y} ${this.accelerometer.z} ${this.accelerometer.pitch} ${this.accelerometer.roll} ${this.accelerometer.acceleration} ${this.accelerometer.inclination} ${this.accelerometer.orientation} ${this.gyro.x} ${this.gyro.y} ${this.gyro.z}`;

        stream.write(`${data}\r\n`);
    });
});
