#!/bin/bash

echo "Building typescript..."
yarn tsc || (echo Typescript build error && exit 1)

echo "Running \`Checking code formatting with prettier\`..."
prettier -l "src/**/*.*" || (echo Formatting errors, try running \"yarn prettier\" && exit 1)
