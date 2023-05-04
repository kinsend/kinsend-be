#!/bin/bash

cd /home/ec2-user/kinsend-api

# Install pm2-logrotate
pm2 install pm2-logrotate
# Set max log size to 128M
pm2 set pm2-logrotate:max_size 128M
# Enable compression of logs when rotated
pm2 set pm2-logrotate:compress true

# Start the app
pm2 start kinsend-api-pm2.json
