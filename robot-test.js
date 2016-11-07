var Gopigo = require('node-gopigo').Gopigo;

var Commands = Gopigo.commands;
var Robot = Gopigo.robot;

// make robot
robot = new Robot({
  minVoltage: 5.5,
  criticalVoltage: 1.2,
  debug: true,
});

// wire up some events
robot.on('lowVoltage', function onLowVoltage(voltage) {
  console.log('(!!) Voltage is low ['+voltage+']');
});

function doSomething(){
    robot.motion.right();
    setTimeout(function(){
        robot.motion.stop();
    }, 2000);
    console.log('did something');
}

robot.init();

doSomething();