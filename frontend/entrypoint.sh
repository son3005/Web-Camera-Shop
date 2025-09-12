#!/bin/sh


echo ">>>> Running pnpm install..."
pnpm install

echo ">>>> Starting dev server..."

exec "$@"