#!/usr/bin/perl

use strict;

my $external_ip = $ARGV[0];

if (!$external_ip) {
	printf "Please provide an external ip";
	exit 1;
}

my $replace = quotemeta($external_ip);

`perl -i -ple "s/localhost\:3000/$replace\:8080/g" /var/www/html/components/services/*.js`
`perl -i -ple "s/localhost\:80/$replace\:80/g" /usr/pkg/aceapi/routes/handlers/*.js`