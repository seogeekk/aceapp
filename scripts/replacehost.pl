#!/usr/bin/perl

use strict;

my $external_ip = $ARGV[0];

if (!$external_ip) {
	printf "Please provide an external ip \n";
	exit 1;
}

my $replace = quotemeta($external_ip);


`perl -i -ple "s/http\:/https\:/g" /var/www/html/components/services/*.js`;
`perl -i -ple "s/localhost\:3000/$replace/g" /var/www/html/components/services/*.js`;