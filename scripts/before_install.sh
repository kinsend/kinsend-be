#!/bin/bash
cd /home/ec2-user/kinsend-api
curl -sL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
sudo yum -y install nodejs npm
sudo npm i -g pm2
ls -la
