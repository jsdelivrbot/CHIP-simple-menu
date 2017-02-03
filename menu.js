var five = require('johnny-five')
var chipio = require('chip-io')
var fs = require('fs')
var exec = require('child_process').exec
exec('echo none | tee "/sys/class/leds/chip:white:status/trigger"')

var menu = [
  {
    label:'menu',
    cmd:'say nothing'
  },
  {
    label:'uptime',
    cmd:'say \`date "+%I:%M %p, %A, %e %B %Y"\`. \`uptime -p\`'
  },
  {
    label:'reboot',
    cmd:'init 6'
  },
  {
    label:'shutdown',
    cmd:'init 0'
  },
  {
    label:'temperature',
    cmd:'bin=$(( $((\`/usr/sbin/i2cget -y -f 0 0x34 0x5e\` << 4)) | $((\`/usr/sbin/i2cget -y -f 0 0x34 0x5f\` & 0x0F)) )); cel=\`echo $bin | awk \'{printf("%.0f", ($1/10) - 144.7)}\'\`; say "$cel degrees celcius"'
  },
]

var board = new five.Board({
  repl: false,
  debug: false,
  io: new chipio()
})

board.on('ready', function() {
  var statusLed = new chipio.StatusLed()
  var onboardButton = new chipio.OnboardButton()
  var lcd = new five.LCD({controller: "PCF8574T", address: 0x3f, bus: 1, rows: 2, cols: 16})
  var press_timeout
  var press_timeout_length = 1200
  var press_count = 0
  onboardButton.on('up', function() {
    statusLed.on()
    setTimeout(function(){statusLed.off()},50)
    press_count++
    lcd.clear().cursor(0,0).print(press_count)
    clearTimeout(press_timeout)
    press_timeout = setTimeout(function(){
      if(press_count===1){
        lcd.clear().cursor(0,0).print('menu')
        exec('say '+menu.map(function(t,i){return (i+1)+'. '+t.label+'.'}).join(' '),function(err,stdout,stderr){})
      } else if(press_count <= menu.length){
        lcd.clear().cursor(0,0).print(menu[press_count-1].label)
        lcd.clear().cursor(1,0).print(menu[press_count-1].cmd)
        exec('say '+press_count+'. '+menu[press_count-1].label+'.; '+menu[press_count-1].cmd,function(err,stdout,stderr){})
      } else {
        lcd.clear().cursor(0,0).print('unknown command')
        exec('say '+press_count+'. unknown command.',function(err,stdout,stderr){})
      }
      press_count = 0
    }, press_timeout_length)
  })
})
