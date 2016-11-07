var Gopigo = require('node-gopigo').Gopigo;
var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://broker.hivemq.com');

var Commands = Gopigo.commands;
// var Encoders = Gopigo.encoders;
var Robot = Gopigo.robot;
var currentSpeed = 200;
var TURN_SPEED = 100;

robot = new Robot({
  minVoltage: 3,
  criticalVoltage: 1.2,
  debug: true,
});

robot.on('error', function onError(err) {
  console.log('Something went wrong');
  console.log(err);
});
robot.on('free', function onFree() {
  console.log('GoPiGo is free to go');
});
robot.on('halt', function onHalt() {
  console.log('GoPiGo is halted');
});
robot.on('close', function onClose() {
  console.log('GoPiGo is going to sleep');
});
robot.on('reset', function onReset() {
  console.log('GoPiGo is resetting');
});
robot.on('normalVoltage', function onNormalVoltage(voltage) {
  console.log('Voltage is ok ['+voltage+']');
});
robot.on('lowVoltage', function onLowVoltage(voltage) {
  console.log('(!!) Voltage is low ['+voltage+']');
});
robot.on('criticalVoltage', function onCriticalVoltage(voltage) {
  console.log('(!!!) Voltage is critical ['+voltage+']');
});

robot.init();
robot.motion.trimWrite(-5);
console.log('OptimusPrime rolling out with trim: ', robot.motion.trimRead());

client.on('connect', function () {
  client.subscribe('/bbr2016/0f31707e7c5b4292');
  client.publish('/bbr2016/0f31707e7c5b4292', 'subscribed');
});

client.on('message', function (topic, message) {
  console.log(message.toString());
  handleAnswer(message.toString());
});

function getMiliSeconds(answer) {
  var msString = answer.substring(answer.lastIndexOf(' '), answer.length);
  return parseInt(msString);
}

function handleAnswer(answer) {

  if (answer.indexOf('turn around') > -1) {
    robot.motion.left();
    setTimeout(function(){
        robot.motion.stop();
    }, 2000);
    console.log('Turning around 180 degrees');
  }

  if (answer.indexOf('evasive action') > -1) {
    var previousSpeed = currentSpeed;
    robot.motion.setSpeed(255);
    robot.motion.backward(false);
    setTimeout(function(){
        robot.motion.stop();
    }, 1000);
    robot.motion.setSpeed(previousSpeed);
    console.log('Evasive action!!');
  }

  if (answer.indexOf('attack') > -1) {
    var previousSpeed = currentSpeed;
    robot.motion.setSpeed(255);
    robot.motion.forward();
    setTimeout(function(){
        robot.motion.stop();
    }, 1000);
    robot.motion.setSpeed(previousSpeed);
    console.log('Evasive action!!');
  }

  if (answer.indexOf('turn left ms ') > -1) {
    var ms = getMiliSeconds(answer);
    var res = robot.motion.left();
    setTimeout(function(){
        robot.motion.stop();
    }, ms);
    console.log('Turning left ms: ' + ms);
  }

  if (answer.indexOf('turn right ms ') > -1) {
    var ms = getMiliSeconds(answer);
    var res = robot.motion.right();
    setTimeout(function(){
        robot.motion.stop();
    }, ms);
    console.log('Turning right ms: ' + ms);
  }

  if (answer.indexOf('turn right slow') > -1) {
    var previousSpeed = currentSpeed;
    robot.motion.setSpeed(TURN_SPEED);
    var res = robot.motion.right();
    robot.motion.setSpeed(previousSpeed);
    console.log('Turning right slow');
  }

  if (answer.indexOf('turn left slow') > -1) {
    var previousSpeed = currentSpeed;
    robot.motion.setSpeed(TURN_SPEED);
    var res = robot.motion.left();
    robot.motion.setSpeed(previousSpeed);
    console.log('Turning left slow');
  }

  if (answer.indexOf('set speed ') > -1) {
    var speed = getMiliSeconds(answer);
    currentSpeed = speed;
    var res = robot.motion.setSpeed(speed);
    console.log('Setting speed: ' + speed);
  }

  if (answer.indexOf('circle left') > -1) {
    var res = robot.motion.setLeftSpeed(currentSpeed - 30);
    console.log('Circling left: ' + currentSpeed - 30);
  }

  if (answer.indexOf('circle right') > -1) {
    var res = robot.motion.setRightSpeed(currentSpeed - 30);
    console.log('Circling right: ' + currentSpeed - 30);
  }

  if (answer.indexOf('trim read') > -1) {
    var res = robot.motion.trimRead();
    console.log('Trim: ' + res);
  }

  if (answer.indexOf('trim write ') > -1) {
    var ms = getMiliSeconds(answer);
    var res = robot.motion.trimWrite(ms);
    console.log('Setting trim: ' + robot.motion.trimRead());
  }

  switch (answer) {
    case 'reset':
      robot.reset()
    break
    case 'left led on':
      var res = robot.ledLeft.on()
      console.log('Left led on::'+res)
    break
    case 'left led off':
      var res = robot.ledLeft.off()
      console.log('Left led off::'+res)
    break
    case 'right led on':
      var res = robot.ledRight.on()
      console.log('Right led on::'+res)
    break
    case 'right led off':
      var res = robot.ledRight.off()
      console.log('Right led off::'+res)
    break
    case 'move forward':
    case 'w':
      robot.motion.setSpeed(currentSpeed);
      var res = robot.motion.forward(false);
      console.log('Moving forward::' + res)
    break
    case 'turn left':
    case 'a':
      var res = robot.motion.left()
      console.log('Turning left::' + res)
    break
    case 'turn right':
    case 'd':
      var res = robot.motion.right()
      console.log('Turning right::' + res)
    break
    case 'turn left rotation':
      var res = robot.motion.leftWithRotation()
      console.log('Turning left::' + res)
    break
    case 'turn right rotation':
      var res = robot.motion.rightWithRotation()
      console.log('Turning right::' + res)
    break
    case 'move backward':
    case 's':
      var res = robot.motion.backward(false)
      console.log('Moving backward::' + res)
    break
    case 'stop':
    case 'x':
      var res = robot.motion.stop()
      console.log('Stop::' + res)
    break
    case 'increase speed':
    case 't':
      var res = robot.motion.increaseSpeed()
      console.log('Increasing speed::' + res)
    break
    case 'decrease speed':
    case 'g':
      var res = robot.motion.decreaseSpeed()
      console.log('Decreasing speed::' + res)
    break
    case 'voltage':
    case 'v':
      var res = robot.board.getVoltage()
      console.log('Voltage::' + res + ' V')
    break
    case 'servo test':
    case 'b':
      robot.servo.move(0)
      console.log('Servo in position 0')

      robot.board.wait(1000)
      robot.servo.move(180)
      console.log('Servo in position 180')

      robot.board.wait(1000)
      robot.servo.move(90)
      console.log('Servo in position 90')
    break
    case 'exit':
    case 'z':
      robot.close()
      process.exit()
    break
    case 'ultrasonic distance':
    case 'u':
      var res = robot.ultraSonicSensor.getDistance()
      console.log('Ultrasonic Distance::' + res + ' cm')
    break
    case 'ir receive':
      var res = robot.IRReceiverSensor.read()
      console.log('IR Receiver data::')
      console.log(res)
    break
    case 'l':
      // TODO
    break
    case 'move forward with pid':
    case 'i':
      var res = robot.motion.forward(true)
      console.log('Moving forward::' + res)
    break
    case 'move backward with pid':
    case 'k':
      var res = robot.motion.backward(true)
      console.log('Moving backward::' + res)
    break
    case 'rotate left':
    case 'n':
      var res = robot.motion.leftWithRotation()
      console.log('Rotating left::' + res)
    break
    case 'rotate right':
    case 'm':
      var res = robot.motion.rightWithRotation()
      console.log('Rotating right::' + res)
    break
    case 'set encoder targeting':
    case 'y':
      var res = robot.encoders.targeting(1, 1, 18)
      console.log('Setting encoder targeting:1:1:18::' + res)
    break
    case 'firmware version':
    case 'f':
      var res = robot.board.version()
      console.log('Firmware version::' + res)
    break
    case 'board revision':
      var res = robot.board.revision()
      console.log('Board revision::' + res)
    break
  }
}


/*
Ingvar
Per Frode
Rune
Stian
*/