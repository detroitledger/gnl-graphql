#!/bin/bash

export NODE_ENV=test

echo "Building typescript..."
yarn tsc || (echo Typescript build error && exit 1)

echo "Running \`Checking code formatting with prettier\`..."
prettier -l "src/**/*.*" || (echo Formatting errors, try running \"yarn prettier\" && exit 1)

echo "Creating test database..."
yarn sequelize db:drop && yarn sequelize db:create && yarn sequelize db:migrate || (echo Database creation error && exit 1)

echo "Loading some seed data..."
(yarn sequelize db:seed:all || (echo Databse seed data error && exit 1)) | yarn bunyan -l error
