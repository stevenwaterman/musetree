FROM httpd:2.4
RUN apt-get update
RUN apt-get install curl git zip nano -y
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash
RUN apt-get install --yes nodejs
RUN node -v
RUN npm -v
COPY . .
RUN npm i
RUN npm run build
RUN cp ./public/ /usr/local/apache2/htdocs/