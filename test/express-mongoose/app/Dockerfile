FROM node:18

RUN apt-get update && apt-get install -y netcat-openbsd

COPY run.sh /

ENTRYPOINT ["sh", "/run.sh"]
