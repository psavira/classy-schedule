#!/bin/bash
rm -rf server/build/*
(
    cd client &&
    npx next build &&
    npx next export
) &&
mv client/out/* server/build/
