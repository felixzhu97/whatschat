# API Documentation

This folder contains API documentation and the Postman test collection for WhatsChat.

## Contents

### Postman collection

- [whatschat-api.postman_collection.json](../../zh/rd/api/whatschat-api.postman_collection.json) – Full Postman collection for WhatsChat API

It includes test cases for:

- Health check
- User authentication
- Messages
- File upload
- WebSocket connection
- Other business endpoints

## How to use

### Import the collection

1. Open Postman
2. Click **Import**
3. Select `whatschat-api.postman_collection.json` (from `docs/zh/rd/api/`)
4. The collection will appear in Postman

### Environment variables

Configure before running requests:

- `base_url` – API base URL  
  - Development: `http://localhost:3000`  
  - Production: `https://api.whatschat.com`

### Run tests

1. Select an endpoint in the collection
2. Ensure `base_url` is set
3. Click **Send** and check the response

### Run collection

1. Select the collection or a folder
2. Click **Run**
3. Choose tests and run

## API groups

- **Health** – Server status
- **Auth** – Register, login, token refresh
- **Users** – Profile and updates
- **Messages** – Send, receive, list
- **Files** – Upload, download, manage
- **WebSocket** – Real-time connection (requires WebSocket support in Postman)

## Notes

- Start the server before calling APIs
- Some endpoints require authentication
- File upload may need correct path configuration

## References

- [Postman docs](https://learning.postman.com/)
- [Collection schema](https://schema.getpostman.com/json/collection/v2.1.0/docs/index.html)

English | [中文](../../zh/rd/api/README.md)

Last updated: December 2025
