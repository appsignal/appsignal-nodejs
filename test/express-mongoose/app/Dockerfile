FROM node:20

RUN apt-get update && apt-get install -y netcat-openbsd

COPY run.sh /

ENTRYPOINT ["sh", "/run.sh"]
