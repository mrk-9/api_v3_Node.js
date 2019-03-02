# PGA API v3

[![CircleCI](https://circleci.com/gh/pgahq/api-v3.svg?style=svg&circle-token=65fd04a5e7cadb5f0f6da9287344a23ef42d68eb)](https://circleci.com/gh/pgahq/api-v3)
[![Maintainability](https://api.codeclimate.com/v1/badges/a0bc5aa275e56b8bc4dd/maintainability)](https://codeclimate.com/repos/5aaff2888d10b2027c000f28/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/a0bc5aa275e56b8bc4dd/test_coverage)](https://codeclimate.com/repos/5aaff2888d10b2027c000f28/test_coverage)

## Starting Development Environment
```
cd docker
source up
```

This will launch container for `DynamoDB local` and a node container to seed DynamodDB Local.
`DynamoDB Local` will be mapped to http://localhost:8000 on your host,
or http://dynamodb:8000/ from inside the containers.

You can start `SAM Local` with `npm start`.
`SAM Local` will be mapped to `http://localhost:3000/`

## DynamoDB & SAM Local Logs

Check the logs if `DynamoDB` fails to start:
```
cd docker
docker-compose logs -f
```

## Stopping Development Environment
```
cd docker
./down
```
