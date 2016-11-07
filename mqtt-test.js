var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://broker.hivemq.com');

console.log('OptimusPrime powering up');

client.on('connect', function () {
  client.subscribe('/bbr2016/0f31707e7c5b4292');
  client.publish('/bbr2016/0f31707e7c5b4292', 'Hello mqtt');
});

client.on('message', function (topic, message) {
  console.log('Got a message on topic', topic);
  console.log(message.toString());
});



/*
Ingvar
Per Frode
Rune
Stian
*/