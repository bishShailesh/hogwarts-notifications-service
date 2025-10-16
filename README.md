# hogwarts-notifications-service

This is a simple notification service for Hogwarts, built with Serverless. It lets you create, list, and deliver notifications to students and professors. You can run everything locally using DynamoDB Local and LocalStack for SQS and SNS.

---

## Why These AWS Services?

I picked these AWS services because they’re a good fit for a serverless, event-driven app:

- **API Gateway** (simulated locally): Makes it easy to expose HTTP endpoints for clients.
- **Lambda Functions**: No need to manage servers, and they scale automatically.
- **DynamoDB**: Fast, flexible, and works well with Lambda for storing notifications.
- **SQS**: Lets us queue up notification deliveries so we don’t lose messages if something fails.
- **SNS**: Enables sending notifications to email (and other endpoints) via topics.

For local dev, I used DynamoDB Local and LocalStack so I don’t have to pay for AWS while testing.

---

## Architecture Overview

- **API Gateway**: Handles HTTP requests for creating, listing, and getting notifications.
- **Lambda Functions**:
  - `createNotification`: HTTP POST, saves notification in DynamoDB, sends a message to SQS.
  - `listNotifications`: HTTP GET, lists notifications from DynamoDB.
  - `getNotification`: HTTP GET by ID, fetches notification from DynamoDB.
  - `deliverNotification`: Triggered by SQS, simulates delivery, publishes to SNS (email), and updates status.
- **DynamoDB Local**: Stores notifications.
- **SQS (LocalStack)**: Queues notification delivery tasks.
- **SNS (LocalStack)**: Publishes notifications to email endpoints.

---

## Architecture Diagram

Below is a high-level architecture for the Hogwarts Notifications Service:

                +-------------------+
                |   API Gateway     |
                | (HTTP Endpoints)  |
                +---------+---------+
                          |
                          v
                +---------------------------+
                | Lambda: createNotification|
                +---------------------------+
                          |
                          v
                +-------------------+
                |   DynamoDB Table  |
                +-------------------+
                          |
                          v
                +-------------------+
                |     SQS Queue     |
                +---------+---------+
                          |
                          v
            +--------------------------------------+
            | Lambda: deliverNotification          |
            +--------------------------------------+
                          |
                          v
                +-------------------+
                |   DynamoDB Table  |
                +-------------------+
                          |
                          v
                +-------------------+
                |      SNS Topic    |
                +-------------------+
                          |
                          v
                +-------------------+
                |   Email Endpoint  |
                +-------------------+

                +---------------------------+
                | Lambda: listNotifications |
                | Lambda: getNotification   |
                +---------------------------+
                          ^
                          |
                +-------------------+
                |   API Gateway     |
                | (HTTP Endpoints)  |
                +-------------------+

---

**Flow:**

- **Create Notification:**
  - Client sends a POST request to API Gateway.
  - API Gateway triggers `createNotification` Lambda.
  - Lambda stores the notification in DynamoDB and enqueues a delivery task in SQS.
- **List/Get Notification:**
  - Client sends a GET request to API Gateway.
  - API Gateway triggers `listNotifications` or `getNotification` Lambda.
  - Lambda reads notifications from DynamoDB.
- **Deliver Notification:**
  - SQS triggers `deliverNotification` Lambda.
  - Lambda simulates delivery, publishes to SNS (email), and updates the notification status in DynamoDB.

---

## Local Setup: DynamoDB and SQS

### 1. DynamoDB Local

```sh
# Download and unzip DynamoDB Local
mkdir -p .dynamodb
cd .dynamodb
curl -O https://s3.us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.zip
unzip dynamodb_local_latest.zip
rm dynamodb_local_latest.zip
cd ..

# Start DynamoDB Local
java -Djava.library.path=.dynamodb/DynamoDBLocal_lib -jar .dynamodb/DynamoDBLocal.jar -sharedDb -port 8000

# Start DynamoDB Local using npn command
npm run dynamodb:start:manual
```

### 2. Create DynamoDB Table

```sh
aws dynamodb create-table \
  --table-name hogwarts-notifications-offline \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000 \
  --region us-east-1
```

### 3. SQS Queue with LocalStack

Make sure Docker is running, then start LocalStack:

```sh
localstack start
```

Create the SQS queue:

```sh
aws --endpoint-url=http://localhost:4566 sqs create-queue \
  --queue-name hogwarts-notification-queue-offline \
  --region us-east-1
```

Create the SNS topic:

```sh
aws --endpoint-url=http://localhost:4566 sns create-topic \
  --name hogwarts-notifications-topic-offline \
  --region us-east-1
```

---

### 4. Check Everything Is Up

List DynamoDB tables:

```sh
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

List SQS queues:

```sh
aws --endpoint-url=http://localhost:4566 sqs list-queues
```

List SNS topics:

```sh
aws --endpoint-url=http://localhost:4566 sns list-topics
```

---

### 5. Build & Run Locally

```sh
npm i
npm run generate:types
npm run build
npm run sls:offline
```

---

## Example Requests

### Create a Notification

> `recipientId`, `recipientEmail`, `message`, `senderId` are required!

```sh
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{"message":"Welcome to Hogwarts!", "recipientEmail":"Hermione Granger", "recipientId":"user-1234", "senderId":"prof-snape"}'
```

### List Notifications (with optional filters and metadata in response)

```sh
curl "http://localhost:3000/notifications?recipientId=user-1234&senderId=prof-snape&limit=5"
```

Or to list all notifications:

```sh
curl http://localhost:3000/notifications
```

_Response will include:_

```json
{
  "metadata": {
    "total": 25,
    "returned": 5,
    "filter": {
      "recipientId": "user-1234",
      "senderId": "prof-snape",
      "limit": 5
    },
    "limit": 5
  },
  "notifications": [
    {
      /* notification objects */
    }
  ]
}
```

### Get a Notification by ID

```sh
curl http://localhost:3000/notifications/<NOTIFICATION_ID>
```

### Manually Trigger SQS Lambda (for local testing)

```sh
curl -X POST http://localhost:3002/2015-03-31/functions/hogwarts-notifications-service-offline-deliverNotification/invocations \
  -d '{"Records":[{"body":"{\"notificationId\":\"NOTIFICATION_ID\"}"}]}'
```

---

## Running Unit Tests

This project uses [Jest](https://jestjs.io/) for unit testing.

### Run All Tests

```sh
npm test
```

---

## Running in AWS

If you want to deploy to AWS:

- Update `serverless.yaml` with your AWS account and region.
- Run `serverless deploy` and use the API Gateway endpoints it gives you.

---

## Notes

- You need Docker for LocalStack, AWS CLI, and DynamoDB Local.
- For local testing, you manually invoke the SQS Lambda.
- No AWS charges for local dev.
- If you get stuck, check the error messages—they’re usually pretty clear.
