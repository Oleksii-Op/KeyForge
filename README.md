# KeyForge - Modern Cryptographic Toolkit


KeyForge is a modern, user-friendly web application that provides powerful 
cryptographic tools with an intuitive interface. The application allows users
to generate secure cryptographic keys, create hashes, and verify file 
integrity using industry-standard algorithms.

## 🔐 Features

### Hash Generation
- **Simple Hashing**: Generate hashes using SHA-256, SHA-384, SHA-512, and MD5 algorithms
- **Argon2 Password Hashing**: Create secure password hashes with configurable parameters
- **Bcrypt Password Hashing**: Alternative password hashing with adjustable work factor
- **Random Token Generation**: Create cryptographically secure random tokens

### Key Generation
- **RSA Keys**: Generate RSA private keys with selectable key sizes (1024, 2048, 4096, 8192 bits)
- **ED25519 Keys**: Create modern elliptic curve cryptographic keys
- **Password Protection**: Optionally encrypt private keys with a password
- **Public Key Extraction**: Derive public keys from private keys

### File Checksum
- **File Integrity Verification**: Calculate cryptographic hashes for uploaded files
- **Multiple Algorithms**: Choose between different hashing algorithms
- **Size Verification**: Automatic file size validation

## 🛠️ Technology Stack

### Frontend
- **React**: Modern UI library for building interactive interfaces
- **TypeScript**: Type-safe JavaScript for better reliability
- **Vite**: Next-generation frontend tooling for fast development
- **Tailwind CSS**: Utility-first CSS framework for custom designs
- **Shadcn UI**: High-quality UI components built with Radix UI and Tailwind
- **Framer Motion**: Animation library for smooth, performant transitions
- **React Query**: Data fetching and state management library
- **React Router**: Client-side routing for single-page applications

### Backend
- **FastAPI**: Modern, high-performance Python web framework
- **OpenTelemetry**: Application observability framework for monitoring and tracing
- **Cryptographic Libraries**:
  - **cryptography**: For RSA and ED25519 key generation and handling
  - **argon2-cffi**: For Argon2 password hashing
  - **bcrypt**: For Bcrypt password hashing
  - **hashlib**: For general-purpose hashing functions

### Reverse proxy
- **Nginx**: A web server that serves frontend static assets while 
acting as a reverse proxy and load balancer (Round-Robin). It also 
integrates the OpenTelemetry module for request tracing and monitoring.

### Observability
- **Prometheus**: A powerful metrics collection and monitoring system used to
scrape and store backend and infrastructure metrics.
- **Grafana**: A visualization and analytics platform that
provides dashboards to monitor application performance, infrastructure, and logs.
- **Loki**: A log aggregation system that efficiently collects 
and indexes logs from different components without requiring full indexing.
- **Tempo**: A distributed tracing system that enables end-to-end
request tracking across services, providing insights into request latencies and dependencies.

## 🏗️ Architecture

The application follows a client-server architecture:

1. The React frontend provides an intuitive interface for users to interact with cryptographic tools
2. API requests are sent to the FastAPI backend for processing
3. The backend performs the actual cryptographic operations and returns results
4. Results are displayed to users through a clean, responsive interface

With Grafana, Loki, Tempo, and Prometheus integrated, the application achieves full observability by covering:

- **Metrics (Prometheus + Grafana Dashboards)**
- **Logs (Loki + Grafana Dashboards)**
- **Traces (Tempo + Grafana Dashboards)**

This ensures better performance monitoring, issue detection, and debugging capabilities in a single observability platform. 🚀

## 🔍 Security Considerations

- **Ephemeral Processing**: Data is processed and immediately discarded after returning results
- **No Data Collection**: The application doesn't track, store, or analyze user data
- **Client-Side Security**: Sensitive data is not stored in browser storage
- **Strong Defaults**: Conservative default parameters for cryptographic operations

## 🚀 Getting Started

> [!Note]
> All the passwords and keys are fake and are not used anywhere.
> Consider creating your own self-signed SSL certs and secrets
```shell
# For Nginx
1. openssl genpkey -algorithm RSA -out server.key -pkeyopt rsa_keygen_bits:4096
2. openssl req -x509 -key server.key -out server.crt -days 365
3. openssl dhparam -out dhparam.pem 2048

# Do steps 1 and 2 for Grafana 
```


1. [Loki Docker Driver](https://grafana.com/docs/loki/latest/clients/docker-driver/) is required.
   ```shell
   docker plugin install grafana/loki-docker-driver:2.9.2 --alias loki --grant-all-permissions
   ```
2. Create .env files for backend and frontend and docker compose
  Those are required and will be overwritten by docker-compose env variables.
  ```shell
  /KeyForge/application$ cp .env.template .env
  cd ../frontend
  /KeyForge/frontend$ cp .env.template .env
  cd ..
  /KeyForge/$ cp .env.template .env
  ```

3. Verify .env file in the root directory for docker-compose.yaml
```shell
# APP COMMON
PROJECT_NAME=KeyForge
COLLECTOR_HOST=http://tempo
COLLECTOR_PORT=4317
FRONTEND_HOST=https://reverse-proxy/
BACKEND_CORS_ORIGINS=http://prometheus/
HEALTH_CHECK_ENDPOINT=wget --no-verbose --tries=1 -O /dev/null http://127.0.0.1:8000/utils/health-check || exit 1

# Backend 1
# service name is hardcoded in nginx.conf and grafana dashboards
# change these above if the service name is to be changed
SERVICE_NAME_1=app-a
REPLICA_ID_1=1

# Backend 2
# service name is hardcoded in nginx.conf and grafana dashboards
# change these above if the service name is to be changed
SERVICE_NAME_2=app-b
REPLICA_ID_2=2
```

4. Run the services
  ```shell
  docker compose up -d  
  ```
5. View the main page [https://localhost/](https://localhost/)
> [!NOTE]
> Your browser may complain about self-signed certificate, just accept.

6. Log into Grafana [https://localhost:3000/](https://localhost:3000/)
```shell
username: admin
password: qwerty
```
> [!NOTE]
> Your browser may complain about self-signed certificate, just accept.

## 🌐 API Endpoints

The application communicates with a backend API with the following endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/random-token` | GET | Generate a random token |
| `/api/argon2-hash` | POST | Create an Argon2 hash |
| `/api/bcrypt-hash` | POST | Create a Bcrypt hash |
| `/api/hashlib` | POST | Create a hash using standard algorithms |
| `/api/genrsa-private-key` | POST | Generate an RSA private key |
| `/api/gened25519-private-key` | POST | Generate an ED25519 private key |
| `/api/gen-public-key` | POST | Generate a public key from a private key |
| `/api/file-sum` | POST | Calculate file checksum |


## Images
### Main Page
![mainpage.png](/images/mainpage.png)
### Private/Public Key Generation
![keys.png](/images/keys.png)
### File Sum Calculation
![filesum.png](/images/filesum.png)
```shell
:~/Downloads$ sha256sum postman-linux-x64.tar.gz 
9640dec4f3f9ac93276958d1ffb150d349193e39dc476571e6b0b62cba5fbab0  postman-linux-x64.tar.gz

```
### Logs/Metrics/Traces
![logs_traces.png](/images/logs_traces.png)
![metrics.png](/images/metrics.png)
![tempo_loki.png](/images/tempo_loki.png)



## 📄 License

This project is licensed under the GNU GENERAL PUBLIC LICENSE - see the LICENSE file for details.


## Load Testing and Performance Issues with FastAPI and RSA Key Generation

### Overview
During load testing, a performance issue was identified in a FastAPI-based
backend running behind an NGINX reverse proxy with round-robin load balancing.
The backend consists of two Docker containers, each running four Uvicorn workers.

A Bash script simulates high-load scenarios by sending asynchronous API requests,
including computationally expensive RSA key generation (up to 8192-bit keys).
Under extreme conditions, this heavy load causes the backends to crash.

### Consequences?

Potential Denial of Service (DoS) vulnerability.

### Possible Solutions

1. Rate Limiting
Implement fastapi-limiter to restrict access to resource-intensive endpoints.
This can mitigate DoS attacks but is ineffective against DDoS.

2. Worker Scaling
Increase backend replicas or Uvicorn workers to distribute the load.
While this improves capacity, it does not eliminate the computational bottleneck.

3. Offloading RSA Generation to AWS Lambda
Move RSA key generation to an AWS Lambda function, offloading 
the computational workload to a scalable cloud service.
This is one of the best solutions.

4. Pre-Generated Keys in Redis
Create a separate backend that pre-generates and stores RSA keys in Redis.
This reduces real-time computation but is ineffective if a user requires password-based encryption.

### Conclusion
The best approach is to offload RSA key generation to a scalable 
cloud function like AWS Lambda while maintaining monitoring and tracing for improved observability.