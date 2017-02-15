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
  var thermometer = new chipio.InternalTemperature()
  var temperature = 'unknown'
  var lcd = new five.LCD({controller: "PCF8574T", address: 0x3f, bus: 1, rows: 2, cols: 16})

  var show = function(type, txt, cb){
    console.log(type, txt)
    switch(type){
      case 'say':
        exec('say '+txt,function(stdout,stderr){
          if(cb) cb()
        })
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
      label:'Menu',
      cmd:function(){
        var menulist = menu.map(function(t,i){return (i+1)+'. '+t.label+'.'}).join(' ')
        show('lcd2', 'reading menu')
        show('say', menulist)
        setTimeout(function(){
          show('lcd1','READY!')
        }, 5000)
      }
    },
    {
      label:'Countdown',
      cmd:function(){
        var t = 60*10
        var clock = setInterval(function(){
          if(press_count) clearInterval(clock)
          show('lcd2',t.toString())
          if(t%60===0) show('say',t+' seconds remain')
          t--
          if(t<0) {
            clearInterval(clock)
            show('say','10 minutes has passed')
          }
        },1000)
      }
    },
    {
      label:'Clock',
      cmd:function(){
        var clock = setInterval(function(){
          if(press_count) clearInterval(clock)
          show('lcd1',moment().format('dddd'))
          show('lcd2',moment().format('hh:mm:ss a'))
        },1000)
      }
    },
    {
      label:'Uptime',
      cmd:function(){
        var uptime = execSync('uptime -p').toString().trim()
        show('lcd2', uptime)
        show('say', uptime)
        setTimeout(function(){
          show('lcd1','READY!')
        }, 5000)
      }
    },
    {
      label:'Temperature',
      cmd:function(){
        //return 'bin=$(( $((\`/usr/sbin/i2cget -y -f 0 0x34 0x5e\` << 4)) | $((\`/usr/sbin/i2cget -y -f 0 0x34 0x5f\` & 0x0F)) )); cel=\`echo $bin | awk \'{printf("%.0f", ($1/10) - 144.7)}\'\`; echo "$cel°C"'        
        var clock = setInterval(function(){
          if(press_count) clearInterval(clock)
          show('lcd2',temperature+'C')
        },500)
        show('say',temperature+'C')
      }
    },
    {
      label:'Animation',
      cmd:function(){
        var animation = [
          [
            'X+-=X+-=X+-=X+-=',
            '-=X+-=X+-=X+-=X+'
          ],
          [
            '-=X+-=X+-=X+-=X+',
            'X+-=X+-=X+-=X+-='
          ]
        ]
        var f = 0;
        var clock = setInterval(function(){
          if(press_count) clearInterval(clock)
          //show('lcd1',animation[f][0])
          show('lcd2',animation[f][1])
          f++
          if(f>animation.length-1) f=0
        },50)
      }
    },
    {
      label:'Reboot',
      cmd:function(){
        show('lcd1', 'X')
        show('lcd2', 'X')
        //execSync('say rebooting; init 6')
        show('say','rebooting', function(){
          execSync('init 6')
        })
      }
    },
    {
      label:'Shutdown',
      cmd:function(){
        show('lcd1', 'X')
        show('lcd2', 'X')
        show('say','shutting down', function(){
          execSync('init 0')
        })
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
      show('lcd1',menu[press_count-1].label)
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

  thermometer.on('change', function(data) {
    temperature = data.celsius.toFixed(2)
    console.log('Internal temperature is ' + temperature + '°C')
  })

  show('lcd1','READY!')
  show('say','menu ready')

})
