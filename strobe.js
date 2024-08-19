const { Board, Led } = require("johnny-five");
const board = new Board({
    port: "COM14", // Check if is your Arduino on this port (this you can make in Arduino IDE)
});

board.on("ready", () => {
    const led = new Led(3);
    led.blink(500);
});
