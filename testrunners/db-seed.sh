#!/bin/bash

export NODE_ENV=test

echo "Loading some seed data..."
(yarn sequelize db:seed:all | yarn bunyan -l error) || exit 1
