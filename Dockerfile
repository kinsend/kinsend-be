FROM node:16-alpine

LABEL authors="martin.todorov@kinsend.io"

RUN set -x \
 && apk add --no-cache curl zip unzip mc htop tree jq \
 && mkdir -p /home/ec2-user/kinsend-api

COPY ./public /home/ec2-user/kinsend-api/public
COPY ./src /home/ec2-user/kinsend-api/src
COPY ./scripts /home/ec2-user/kinsend-api/scripts
COPY ./test /home/ec2-user/kinsend-api/test
COPY ./typings /home/ec2-user/kinsend-api/typings
COPY ./views /home/ec2-user/kinsend-api/views
COPY ./*.json /home/ec2-user/kinsend-api/
COPY ./.eslint* /home/ec2-user/kinsend-api/
COPY ./.env /home/ec2-user/kinsend-api/

WORKDIR /home/ec2-user/kinsend-api

RUN set -x \
 && npm ci

RUN set -x \
 && npm run build \
 && [[ -d dist ]] || { echo "ERROR: Could not find directory dist which should have been produced by npm run build!"; exit 1; }

EXPOSE 3131/tcp

ENTRYPOINT [ "node", "dist/main" ]