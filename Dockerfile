FROM node:14.9 AS build

COPY ./package.json /srv/hedera-hts-demo/package.json
COPY ./yarn.lock /srv/hedera-hts-demo/yarn.lock
COPY ./.browserslistrc /srv/hedera-hts-demo/.browserslistrc
COPY ./.eslintrc.js /srv/hedera-hts-demo/.eslintrc.js
COPY ./babel.config.js /srv/hedera-hts-demo/babel.config.js
COPY ./vue.config.js /srv/hedera-hts-demo/vue.config.js
COPY ./.env /srv/hedera-hts-demo/.env
COPY ./.env /srv/hedera-hts-demo/.env.production
ADD ./src /srv/hedera-hts-demo/src
ADD ./public /srv/hedera-hts-demo/public

RUN cd /srv/hedera-hts-demo && yarn install
RUN cd /srv/hedera-hts-demo && yarn build

FROM nginx:alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /srv/hedera-hts-demo/dist /usr/share/nginx/html
COPY --from=build /srv/hedera-hts-demo/.env /usr/share/nginx/html/.env
COPY --from=build /srv/hedera-hts-demo/.env /usr/share/nginx/html/.env.production

CMD ["nginx", "-g", "daemon off;"]
