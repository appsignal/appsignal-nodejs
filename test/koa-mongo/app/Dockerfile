FROM node:16

RUN apt-get update && apt-get install -y netcat

COPY run.sh /

ENTRYPOINT ["sh", "/run.sh"]
