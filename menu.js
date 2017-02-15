var five = require('johnny-five')
var chipio = require('chip-io')
var fs = require('fs')
var exec = require('child_process').exec
var execSync = require('child_process').execSync
var moment = require('moment')

var menu = require('./scripts')

execSync('echo none | tee "/sys/class/leds/chip:white:status/trigger"')

var board = new five.Board({
  repl: false,
  debug: false,
  io: new chipio()
})

board.on('ready', function() {
  
  var press_timeout
  var press_timeout_length = 2000
  var press_count = 0

  var statusLed = new chipio.StatusLed()
  var onboardButton = new chipio.OnboardButton()

  var thermometer = new chipio.InternalTemperature()
  var temperature = 'unknown'
  thermometer.on('change', function(data) {
    temperature = data.celsius.toFixed(2)
  })
  
  var voltmeter = new chipio.BatteryVoltage()
  var voltage = 'unknown'
  voltmeter.on('change', function(v) {
    voltage = v.toFixed(2)
  });

  var say = function(type, txt, cb){
    exec('say '+txt,function(stdout,stderr){
      if(cb) cb()
    })
  }

  onboardButton.on('up', function(x) {

    console.log(x)
    
    statusLed.on()
    setTimeout(function(){statusLed.off()},50)
    press_count++
    clearTimeout(press_timeout)
        
    press_timeout = setTimeout(function(){
      if(typeof menu[press_count-1] !== 'undefined'){
        menu[press_count-1].cmd()
      } else {
        say(press_count+' undefined')
      }
      press_count = 0
    }, press_timeout_length)

  })

  say('menu ready')

})
