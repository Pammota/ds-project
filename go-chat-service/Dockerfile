# Use an official Golang runtime as the base image
FROM golang:1.21

# Set the working directory in the container
WORKDIR /app

# Copy the Go application source code to the working directory
COPY . .

RUN go mod tidy

# Build the Go application
RUN go build -o main

# Expose the port on which the Go application will run
EXPOSE 8090

# Start the Go application
CMD ["./main"]