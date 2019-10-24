FROM docker:latest
RUN apk update && apk add git nodejs yarn libc6-compat
RUN ln -s /lib/libc.musl-x86_64.so.1 /lib/ld-linux-x86-64.so.2

VOLUME [ '/data' ]

COPY . /app
WORKDIR /app

RUN yarn

CMD yarn start