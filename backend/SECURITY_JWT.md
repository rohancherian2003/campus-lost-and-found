# Secure JWT Configuration and Startup Validation

The Campus Lost & Found Management System backend requires the `JWT_SECRET` environment variable to be set on startup. The application validates this key to prevent administrative token forging.

## Security Controls

1. **Existence Validation**: The application checks for the presence of the environment variable/config property. If missing, startup fails with `java.lang.IllegalStateException: JWT_SECRET environment variable is missing.`
2. **Length Validation**: The value must not be empty. If empty, startup fails with `java.lang.IllegalStateException: JWT_SECRET environment variable is empty.`
3. **Entropy Validation**: The secret must be at least 32 characters long. A key length of 64+ characters is recommended for symmetric HS256 encryption. If it is shorter than 32 characters, startup fails with `java.lang.IllegalStateException: JWT_SECRET is too short. Minimum required length is 32 characters for security compliance.`
4. **Zero-Log Policy**: The secret value is never printed to standard output, system logs, stack traces, or returned in API error responses.

## Deployment Configurations

### 1. Local Development (Terminal)

Define the variable in your current terminal session:

```bash
export JWT_SECRET="your-secure-random-secret-key-that-is-at-least-32-characters-long"
mvn exec:java -Dexec.mainClass="com.campus.lostfound.CampusLostFoundApplication"
```

### 2. Docker

Build and run the container passing the secret:

```bash
docker build -t campus-backend ./backend
docker run -d -p 8080:8080 -e JWT_SECRET="your-secure-random-secret-key-that-is-at-least-32-characters-long" campus-backend
```

### 3. Docker Compose

Ensure a `.env` file exists at the root:

```bash
cp .env.example .env
# Open .env and customize JWT_SECRET
docker-compose up --build
```
