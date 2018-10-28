FROM node:latest
COPY . /TripChat

# RUN npm install -g npm@latest
# RUN npm install
# RUN npm run build

WORKDIR /TripChat/EC2
EXPOSE 9000