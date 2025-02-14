#### Disclaimer: this is a university project

## Device Management System

This project was a mandatory part of my curriculum in the 4th year of my Bachelor's Degree. The premise of the project is not that relevant.

### Why include it? 
Because it is one of the projects that has taught me a lot about how to write microservice-based architectures and has introduced me into the wonderful world of Golang.

### What it do?
- user authentication and management (no 3rd party auth providers used)
- device and measurement management and simulation (CRUD + DB persistence + security)
- WebSocket-based live-chatting system
- Next.js powered web app for crud and chat client
- inter-service communication using RabbitMQ
  
### Is it perfect?
Far from it. Being the first time I've _rolled_ my own proper auth I've made some security mistakes. But hey, it works!


#### Running the project
One command required:
`docker compose up --build`
