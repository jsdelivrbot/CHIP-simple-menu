var five = require('johnny-five')
var chipio = require('chip-io')
var fs = require('fs')
var exec = require('child_process').exec
var execSync = require('child_process').execSync
var moment = require('moment')
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
  var lcd = new five.LCD({controller: "PCF8574T", address: 0x3f, bus: 1, rows: 2, cols: 16})

  var show = function(type, txt){
    console.log(type, txt)
    switch(type){
      case 'say':
        exec('say '+txt)
        break;
      case 'lcd1':
        if(txt.length<16){txt = " ".repeat(Math.ceil(16-txt.length)/2)+txt} //center short text
        lcd.clear().cursor(0,0).print(txt)
        break;
      case 'lcd2':
        if(txt.length<16){txt = " ".repeat(Math.ceil(16-txt.length)/2)+txt} //center short text
        lcd.cursor(1,0).print(txt.replace('°',''))
        break;
    }
  }

  var menu = [
    {
      label:'menu',
      cmd:function(){
        return 'echo '+menu.map(function(t,i){return (i+1)+'. '+t.label+'.'}).join(' ')
      }
    },
    {
      label:'uptime',
      cmd:function(){
        return 'echo `date "+%I:%M %p, %A, %e %B %Y"` . `uptime -p`'
      }
    },
    {
      label:'temperature',
      cmd:function(){
        return 'bin=$(( $((\`/usr/sbin/i2cget -y -f 0 0x34 0x5e\` << 4)) | $((\`/usr/sbin/i2cget -y -f 0 0x34 0x5f\` & 0x0F)) )); cel=\`echo $bin | awk \'{printf("%.0f", ($1/10) - 144.7)}\'\`; echo "$cel°C"'
      }
    },
    {
      label:'clock',
      cmd:function(){
        var clock = setInterval(function(){
          if(press_count) clearInterval(clock)
          //lcd.clear()
          var txt = moment().format('dddd')
          if(txt.length<16){txt = " ".repeat(Math.ceil(16-txt.length)/2)+txt} //center short text
          lcd.cursor(0,0).print(txt)

          var txt = moment().format('hh:mm:ss a')
          if(txt.length<16){txt = " ".repeat(Math.ceil(16-txt.length)/2)+txt} //center short text
          lcd.cursor(1,0).print(txt)
        },1000)
      }
    },
    {
      label:'animation',
      cmd:function(){}
        var f = 0;
        var clock = setInterval(function(){
          if(press_count) clearInterval(clock)
          switch(f){
            case 0:
              lcd.cursor(0,0).print('X+-=X+-=X+-=X+-=')
              lcd.cursor(1,0).print('-=X+-=X+-=X+-=X+')
              break;
            case 1:
              lcd.cursor(0,0).print('-=X+-=X+-=X+-=X+')
              lcd.cursor(1,0).print('X+-=X+-=X+-=X+-=')
              break;
          }
          f++
          if(f>1) f=0
        },50)
      }
    },
    {
      label:'countdown',
      cmd:function(){
        var t = 60*10
        var clock = setInterval(function(){
          if(press_count) clearInterval(clock)
          lcd.cursor(0,0).print(t)
          t--
          if(t<0) {
            clearInterval(clock)
            show('say','timer finish')
          }
        },1000)
      }
    },
    {
      label:'reboot',
      cmd:function(){
        return 'init 6'
      }
    },
    {
      label:'shutdown',
      cmd:function(){
        return 'init 0'
      }
    },
  ]

  onboardButton.on('up', function(x) {
    
    statusLed.on()
    setTimeout(function(){statusLed.off()},50)
    press_count++
    console.log(x,'press_count',press_count)
    clearTimeout(press_timeout)
    
    if(typeof menu[press_count-1] !== 'undefined'){
      show('lcd1',press_count+' '+menu[press_count-1].label)
    } else {
      show('lcd1',press_count+' unknown')
    }
    
    press_timeout = setTimeout(function(){
      if(typeof menu[press_count-1] !== 'undefined'){
        menu[press_count-1].cmd()
      } else {
        show('lcd2','undefined')
        show('say','undefined')
        setTimeout(function(){
          show('lcd1','READY!')
        }, 5000)
      }
      press_count = 0
    }, press_timeout_length)

  })

  show('lcd1','READY!')
  show('say','menu ready')

})
