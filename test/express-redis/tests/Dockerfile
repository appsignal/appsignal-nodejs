FROM ruby:3.0

RUN bundle config --global frozen 1

WORKDIR /usr/src/app

COPY . .
RUN bundle install

CMD ["bundle", "exec", "rspec"]