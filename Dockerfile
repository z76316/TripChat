FROM node:latest

COPY . /TripChat

WORKDIR /TripChat/EC2

EXPOSE 9000