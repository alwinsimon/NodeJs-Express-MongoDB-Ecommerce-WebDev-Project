# Command to configure the base image (official Node.js base image)
FROM node:18.16

# Command to update the base image
RUN apt update

# Set the working directory for the container
WORKDIR /app

# Command to copy the package files to working direcotory of the container
COPY package*.json .

# Install dependencies inside the container
RUN npm install

# Copy all the files from the existing directory to the docker container
COPY . .

# Command to set a fixed port for container to listen (exposing a port)
EXPOSE 3000

# Specify the default command to run the application inside the container
CMD ["npm", "start"]