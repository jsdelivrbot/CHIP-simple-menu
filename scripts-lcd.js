module.exports = [
  
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
