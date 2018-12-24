#!/bin/bash

export NODE_ENV=test

echo "Creating test database..."
yarn sequelize db:drop || true
yarn sequelize db:create || exit 1
yarn sequelize db:migrate || exit 1
