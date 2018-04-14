#!/bin/bash

echo "Installing ABO"

type apache2
[[ $? -ne 0 ]] && { echo "Apache2 seems to be not installed"; exit 1; }
ls -ltr /var/www/html >/dev/null
[[ $? -ne 0 ]] && { echo "Apache directory is missing"; exit 1; }

echo ">> Sourcing external IP"
if [[ -z $ACE_EXTERNAL_IP_ADDRESS ]]; then
	echo -e "No External IP set. Please provide a valid IP address: %c"
	read ACE_EXTERNAL_IP_ADDRESS
fi

ACEAPPDIR=/usr/pkg/aceapp

echo ">> Checkout repositories"
if [[ ! -d /usr/pkg/aceapp ]]; then
	mkdir -p /usr/pkg
	cd /usr/pkg
	git clone https://github.com/seogeekk/aceapp.git
fi

echo ">> Updating aceapp"
cd $ACEAPPDIR
git pull
if [[ $? -ne 0 ]]; then
	git stash
	git pull
	[[ $? -ne 0 ]] && { echo "Error: Failed Updating aceapp"; exit 1; }
fi
echo ">> Run npm install"
npm install
if [[ $? -ne 0 ]]; then
	echo "Error: Failed node packages update"
	exit 1
fi
echo ">> Run bower install"
bower install --allow-root
if [[ $? -ne 0 ]]; then
	echo "Error: Failed bower packages update"
	exit 1
fi

echo ">> Copy aceapp to /var/www/html"
cp -rf $ACEAPPDIR/app/* /var/www/html
[[ $? -ne 0 ]] && { echo "Error: Failed copying aceapp files to /var/www/html"; exit 1; }

echo ">> Run replace of external address"
replacehost.pl $ACE_EXTERNAL_IP_ADDRESS
[[ $? -ne 0 ]] && { echo "Error: Failed replacing $ACE_EXTERNAL_IP_ADDRESS"; exit 1; }

echo ">> Check for localhost references"
grep localhost  /var/www/html/components/services/*.js

echo ">> Restart apache2"
service apache2 restart
[[ $? -ne 0 ]] && { echo "Error: Apache2 restart failed"; exit 1; }

echo
echo "*****************" 
echo "ABO install done."
echo "*****************" 