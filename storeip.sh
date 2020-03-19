#!/bin/bash

#store the current IP address and specified port
echo $SSH_CLIENT | sed -n 's/\([0-9\.]*\) .*/\1/p' > ~/data/ip
echo $1 > ~/data/port
cat ~/data/ip ~/data/port
