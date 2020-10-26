#!/usr/bin/env bash

docker run -dt -v $PWD/envoy.yaml:/etc/envoy/envoy.yaml:ro -p 80:80 envoyproxy/envoy:v1.12.0
