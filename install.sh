#!/bin/bash

# must run as ROOT
if [[ $EUID -ne 0 ]]; then
  echo "This script must be run as root" 1>&2
  exit 1
fi

if (whiptail --title "Button Menu" --yesno "Install button menu?" 15 46) then

# installl git
if ! which git >/dev/null; then
  apt install -y git
fi

# install node
if ! which node >/dev/null; then
  echo "nodejs is not installed!"
  bash <(curl -sL "https://cdn.jsdelivr.net/gh/norgeous/CHIP-customiser/scripts/install_nodejs.sh")
fi

bash <(curl -sL "https://cdn.jsdelivr.net/gh/norgeous/CHIP-customiser/scripts/configure_status_led.sh")

# clone this repo
rm -r "/root/CHIP-simple-menu/"
cd "/root/"
git clone "https://github.com/norgeous/CHIP-simple-menu.git"
cd "/root/CHIP-simple-menu/"
sudo npm install # needs sudo, even as root

# menu.service
mv "/root/CHIP-simple-menu/menu.service" "/etc/systemd/system/menu.service"
systemctl enable menu
systemctl restart menu

fi
