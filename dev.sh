#!/bin/bash

# docker run -d -p 3001:3000 -v "$(pwd)":/var/lib/grafana/plugins --name=grafana grafana/grafana

docker stop grafana
npm run build
docker start grafana
