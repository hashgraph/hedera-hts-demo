#docker run -dt -v $PWD/envoy.yaml:/etc/envoy/envoy.yaml:ro -p 80:80 envoyproxy/envoy:v1.12.0
FROM envoyproxy/envoy:v1.12.0

COPY ./envoy.yaml /etc/envoy.yaml

CMD /usr/local/bin/envoy -c /etc/envoy.yaml
