module.exports = [
  
  {
    label:'Menu',
    cmd:function(){
      var menulist = menu.map(function(t,i){return (i+1)+'. '+t.label+'.'}).join(' ')
      show('say', menulist)
    }
  },

  {
    label:'Countdown',
    cmd:function(){
      var t = 60*10
      var clock = setInterval(function(){
        if(press_count) clearInterval(clock)
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
        show('say',moment().format('dddd h m a'))
      },60000)
    }
  },

  {
    label:'Uptime',
    cmd:function(){
      var uptime = execSync('uptime -p').toString().trim()
      show('say', uptime)
    }
  },

  {
    label:'Temperature',
    cmd:function(){
      var bintemp = execSync('bin=$(( $((\`/usr/sbin/i2cget -y -f 0 0x34 0x5e\` << 4)) | $((\`/usr/sbin/i2cget -y -f 0 0x34 0x5f\` & 0x0F)) )); cel=\`echo $bin | awk \'{printf("%.0f", ($1/10) - 144.7)}\'\`; echo "$cel°C"').toString().trim()
      show('say',temperature+'C, '+bintemp)
    }
  },

  {
    label:'Voltage',
    cmd:function(){
      show('say',voltage+' volts')
    }
  },

  {
    label:'Reboot',
    cmd:function(){
      show('say','rebooting', function(){
        execSync('init 6')
      })
    }
  },

  {
    label:'Shutdown',
    cmd:function(){
      show('say','shutting down', function(){
        execSync('init 0')
      })
    }
  },

]
