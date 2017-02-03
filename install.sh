#!/bin/bash

# must run as ROOT
if [[ $EUID -ne 0 ]]; then
  echo "This script must be run as root" 1>&2
  exit 1
fi

if (whiptail --title "Button Menu" --yesno "Install button menu?" 15 46) then

if ! which node >/dev/null; then
  echo "nodejs is not installed!"
  bash <(curl -sL "https://rawgit.com/norgeous/CHIP-customiser/master/scripts/install_nodejs.sh")
fi

apt install git

#rm -r /root/folder
cd /root/
git clone https://github.com/norgeous/CHIP-simple-menu.git

cp menu.service /etc/systemd/system/menu.service
systemctl enable menu
systemctl start menu

fi
