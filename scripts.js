var exec = require('child_process').exec
var execSync = require('child_process').execSync
var moment = require('moment')

var say = function(txt, cb) {
  console.log('say: '+txt)
  exec('say '+txt,function () {
    if(cb) cb()
  })
}

var sinewav = function(f=Math.floor((Math.random() * 880) + 220),d=0.5){
  execSync('( speaker-test -t sine -f '+f+' )& _p=$!; sleep '+(d+0.7)+'; kill -9 $_p')
}

var menu = [
  
  {
    // 1
    label: 'Menu',
    cmd: function() {
      var menulist = menu.map(function(t,i){return (i+1)+'. '+t.label+'.'}).join(' ')
      say('. '+menulist)
    }
  },

  {
    // 2
    label: 'Countdown',
    cmd: function() {
      var t = 600
      var clock = setInterval(function () {
        switch(true){
          case (t>60 && t%60===0):
            say('. '+t/60+' minutes',function(){
              sinewav(t*110)
            })
            break;
          case (t===60):
            say('. 1 minute',function(){
              sinewav(t*110)
            })
            break;
          case (t>10 && t<=50 && t%10===0):
            say('. '+t+' seconds',function(){
              sinewav(t*110)
            })
            break;
          case (t>0 && t<=10):
            say(t)
            sinewav(t*110, 2)
            break;
          case (t===0):
            clearInterval(clock)
            sinewav(440, 4)
            sinewav(440, 0.2)
            sinewav(440, 0.2)
            sinewav(440, 0.2)
            break;
        }
        t--
      },1000)
      return clock
    }
  },

  {
    // 3
    label: 'Clock',
    cmd: function() {
      say('. '+moment().format('dddd Do MMMM YYYY h m a'))
      var clock = setInterval(function(){
        var now = moment()
        if(now.format('HHmmss') === '000000') say('. '+moment().format('dddd Do MMMM YYYY h m a'))  //every day at midnight
        else if(now.format('mmss') === '0000') say('. '+moment().format('h a'))                     //every hour
        else if(now.format('ss') === '00') say('. '+moment().format('m'))                           //every minute
      },1000)
      return clock
    }
  },

  {
    // 4
    label: 'Uptime',
    cmd: function() {
      var uptime = execSync('uptime -p').toString().trim()
      say('. Uptime, '+uptime)
    }
  },

  {
    // 5
    label: 'Temperature',
    cmd: function(stats) {
      var t
      var clock = setInterval(function () {
        if(t !== stats.temperature) {
          t = stats.temperature
          say('. '+stats.temperature+'°C')
        }
      },1000)
      return clock
    }
  },

  {
    // 6
    label: 'Voltage',
    cmd: function(stats) {
      var v
      var clock = setInterval(function () {
        if(v !== stats.voltage) {
          v = stats.voltage
          say('. '+stats.voltage+' Volts')
        }
      },1000)
      return clock
    }
  },

  {
    // 7
    label: 'Reboot',
    cmd: function() {
      say('. Rebooting', function(){
        execSync('init 6')
      })
    }
  },

  {
    // 8
    label: 'Shutdown',
    cmd: function() {
      say('. Shutting down', function(){
        execSync('init 0')
      })
    }
  },

]

module.exports = {say, menu}
