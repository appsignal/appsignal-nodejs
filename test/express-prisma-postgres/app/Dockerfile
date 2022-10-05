FROM node:16

RUN apt-get update && apt-get install -y postgresql-client

COPY run.sh /

ENTRYPOINT ["sh", "/run.sh"]
