#!/bin/bash

echo "Installing ABO"

[[ `type apache2` -ne 0 ]] && { echo "Apache2 seems to be not installed"; exit 1; }
[[ `type nginx` -ne 0 ]] && { echo "Nginx seems to be not installed"; exit 1; }
[[ `ls -ltr /var/www/html >/dev/null` -ne 0 ]] && { echo "Apache directory is missing"; exit 1; }

[[ -z $UPLOAD_DIRECTORY ]] && { echo "UPLOAD_DIRECTORY not set"; exit 1; }
[[ -z $REQUEST_DIRECTORY ]] && { echo "REQUEST_DIRECTORY not set"; exit 1; }

echo "Checking if UPLOAD_DIRECTORY exists: $UPLOAD_DIRECTORY"
if [[ ! -d $UPLOAD_DIRECTORY ]]; then
	mkdir -p $UPLOAD_DIRECTORY
fi
echo "Checking if REQUEST_DIRECTORY exists: $REQUEST_DIRECTORY"
if [[ ! -d $REQUEST_DIRECTORY ]]; then
	mkdir -p $REQUEST_DIRECTORY
fi

echo "Sourcing external IP"
if [[ -z $ACE_EXTERNAL_IP_ADDRESS ]]; then
	echo -e "No External IP set. Please provide a valid IP address: %c"
	read ACE_EXTERNAL_IP_ADDRESS
fi

ACEAPIDIR=/usr/pkg/aceapi
ACEAPPDIR=/usr/pkg/aceapp

echo "Checkout repositories"
if [[ ! -d /usr/pkg/aceapi ]]; then
	mkdir -p /usr/pkg
	cd /usr/pkg
	git clone https://github.com/seogeekk/aceapi.git
fi
if [[ ! -d /usr/pkg/aceapp ]]; then
	mkdir -p /usr/pkg
	cd /usr/pkg
	git clone https://github.com/seogeekk/aceapp.git
fi

echo "Updating aceapi"
cd $ACEAPIDIR
git pull
if [[ $? -ne 0 ]]; then
	git stash
	git pull
	[[ $? -ne 0 ]] && { echo "Error: Failed Updating aceapi"; exit 1; }
fi
echo "Run npm install"
npm install
if [[ $? -ne 0 ]]; then
	echo "Error: Failed node packages update"
	exit 1
fi

echo "Updating aceapp"
cd $ACEAPPDIR
git pull
if [[ $? -ne 0 ]]; then
	git stash
	git pull
	[[ $? -ne 0 ]] && { echo "Error: Failed Updating aceapp"; exit 1; }
fi
echo "Run npm install"
npm install
if [[ $? -ne 0 ]]; then
	echo "Error: Failed node packages update"
	exit 1
fi
echo "Run bower install"
bower install --allow-root
if [[ $? -ne 0 ]]; then
	echo "Error: Failed bower packages update"
	exit 1
fi

echo "Copy aceapp to /var/www/html"
cp -rf $ACEAPPDIR/app/* /var/www/html
[[ $? -ne 0 ]] && { echo "Error: Failed copying aceapp files to /var/www/html"; exit 1; }

echo "Run replace of external address"
replacehost.pl $ACE_EXTERNAL_IP_ADDRESS

echo "Check for localhost references"
grep localhost  /var/www/html/components/services/*.js
grep localhost /usr/pkg/aceapi/routes/handlers/*.js


echo "Start pm2"
if [[ `pm2 info aceapi >/dev/null` -eq 0 ]]; then
	pm2 restart aceapi --update-env
else 
	cd $ACEAPIDIR
	pm2 start ./bin/www --name aceapi --update-env
fi

echo "Restart Nginx"
service nginx restart
[[ $? -ne 0 ]] && { echo "Error: Nginx restart failed"; exit 1; }

echo "Restart apache2"
service apache2 restart
[[ $? -ne 0 ]] && { echo "Error: Apache2 restart failed"; exit 1; }

echo
echo "*****************" 
echo "ABO install done."
echo "*****************" 