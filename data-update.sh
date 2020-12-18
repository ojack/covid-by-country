#!/bin/bash
while true
do
	echo Running data update on $(date)
    npm run update-data
	sleep 14400
done
