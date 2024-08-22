const { Board, IMU, Button } = require("johnny-five");
const board = new Board({ port: "COM14" });
const fs = require("fs");
board.on("ready", () => {
    const button = new Button({ pin: 2, invert: true });
    const imu = new IMU({
        controller: "MPU6050",
    });
    let stream = fs.createWriteStream(`data/sample_punch_0.txt`, {
        flags: "a",
    });
    board.repl.inject({
        button: button,
    });
    console.log("hi");
    imu.on("data", function () {
        console.log("yup");
        let data = `${this.accelerometer.x} ${this.accelerometer.y} ${this.accelerometer.z} ${this.accelerometer.pitch} ${this.accelerometer.roll} ${this.accelerometer.acceleration} ${this.accelerometer.inclination} ${this.accelerometer.orientation} ${this.gyro.x} ${this.gyro.y} ${this.gyro.z}`;

        button.on("hold", function () {
            console.log("hi");
            stream.write(`${data}\r\n`);
        });
    });

    button.on("up", function () {
        console.log("up");
        stream.end();
    });
});
