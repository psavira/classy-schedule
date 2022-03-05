#!/bin/bash
rm -rf server/build/*
(
    cd client &&
    npx next build &&
    npx next export
) &&
mkdir server/build &&
mv client/out/* server/build/
