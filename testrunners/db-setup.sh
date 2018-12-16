#!/bin/bash

export NODE_ENV=test

echo "Creating test database..."
yarn sequelize db:drop || true
yarn sequelize db:create || (echo Error creating test database && exit 1)
yarn sequelize db:migrate || (echo Error running db migrations && exit 1)
