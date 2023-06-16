FROM node:16-alpine

ARG MANIFEST_VERSION="local_build"

LABEL authors="martin.todorov@kinsend.io"

RUN set -x \
 && apk add --no-cache bash curl zip unzip mc htop tree jq \
 && mkdir -p /app

COPY ./public /app/public
COPY ./src /app/src
COPY ./scripts /app/scripts
COPY ./test /app/test
COPY ./typings /app/typings
COPY ./views /app/views
COPY ./*.json /app/
COPY ./.eslint* /app/

WORKDIR /app

RUN set -x \
 && npm ci

RUN set -x \
 && npm run build \
 && [[ ! -f /tmp/test.json ]] && echo "{}" > /app/dist/public/manifest.json \
 && /bin/bash -c "set -xe;cat <<< \$(jq -r '. |= . + { \"git_ref\": \"$MANIFEST_VERSION\" }' /app/dist/public/manifest.json) > /app/dist/public/manifest.json" \
 && cat /app/dist/public/manifest.json \
 && [[ -d dist ]] || { echo "ERROR: Could not find directory dist which should have been produced by npm run build!"; exit 1; }

EXPOSE 3131/tcp

ENTRYPOINT [ "node", "dist/main" ]
