# Description

This is the code for the Kinsend backend. It is a NestJS application that uses MongoDB as a database.

# Libraries

* [Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.
* [ExpressJS](https://expressjs.com/) main core of Nest.
* [MongoDB](https://www.mongodb.com/) No-SQL database.
* [TypeScript](https://www.typescriptlang.org/) Main programing language
* [Architecture](https://en.wikipedia.org/wiki/Domain-driven_design) Domain-driven design
* [TemplateEngine](https://handlebarsjs.com/contributing/interactive-examples.html) Handlebars is an open-source project. 
* [CleanCode](https://eslint.org/) auto format code and remove use code

# Installation

```bash
$ npm install
```

# Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

# Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov

```

# Testing if the app is running

```bash
curl -X GET 'http://localhost:3131/api' \
--header 'Content-Type: application/json' \
--data '{
    "message": "Hello"
}'
```

# AWS
AWS_REGION=
BUCKET_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Docker

* To build the image, execute:
```bash
docker build -t kinsend-be .
docker tag kinsend-be:latest \
       874822220446.dkr.ecr.us-east-1.amazonaws.com/kinsend-be:1.0.0
```

* Login to AWS ECR using `aws-vault`:
```bash
aws-vault exec kinsend-dev -- \
          aws ecr get-login-password --region us-east-1 | \
          docker login --username AWS --password-stdin 874822220446.dkr.ecr.us-east-1.amazonaws.com
```

* Push the Docker image to AWS ECR:
```bash
aws-vault exec kinsend-dev -- \
          docker push 874822220446.dkr.ecr.us-east-1.amazonaws.com/kinsend-be:latest
aws-vault exec kinsend-dev -- \
          docker push 874822220446.dkr.ecr.us-east-1.amazonaws.com/kinsend-be:1.0.0
```

* Running `docker-compose`:
```
docker-compose up
```

# Licenses

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
