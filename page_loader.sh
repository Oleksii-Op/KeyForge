#!/bin/bash

# This script simulates asynchronous GET queries to the specified endpoint.
# It is used to test Prometheus and Grafana metrics.

# DO NOT forget to chmod +x to run the script!!!

# Number of queries
read -e -p "Enter requests number -> " -i 100 NUM_REQUESTS

BASE_URL=https://localhost


get_rand_token() {
  curl --insecure -X 'GET' \
  "${BASE_URL}/api/random-token" \
  -H 'accept: application/json' > /dev/null 2>&1
}

get_argon2() {
  curl --insecure -X 'POST' "${BASE_URL}/api/argon2-hash" \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{"payload": "qwerty","length": 32,"memory_cost": 65536}' > /dev/null 2>&1
}

get_bcrypt() {
  curl --insecure -X 'POST' \
    "${BASE_URL}/api/bcrypt-hash" \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{"payload": "qwerty", "rounds": 12}' > /dev/null 2>&1
}

get_hashlib() {
  for i in sha256 sha384 sha512 md5; do
    curl --insecure -X 'POST' \
      "${BASE_URL}/api/hashlib?algorithm=${i}" \
      -H 'accept: application/json' \
      -H 'Content-Type: application/json' \
      -d '{"payload": "qwerty"}' > /dev/null 2>&1
  done
}

get_rsa_priv_key() {
  for i in 1024 2048 4096 8192; do
    curl --insecure -X 'POST' \
    "${BASE_URL}/api/genrsa-private-key?key_size=${i}" \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{"password": "qwerty"}' > /dev/null 2>&1
  done
}

get_ed25519_priv_key() {
  curl --insecure -X 'POST' \
  "${BASE_URL}/api/gened25519-private-key" \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"password": "qwerty"}' > /dev/null 2>&1
}

HEADER="accept: application/json"

# Maximum number of parallel requests
MAX_PARALLEL=50

# Function to perform a single query
make_request() {
  get_rand_token
  get_argon2
  get_bcrypt
  get_hashlib
#  get_rsa_priv_key # too expensive load, uncomment if you want your pc to suffer
  get_ed25519_priv_key
}

# Counter for active background jobs
active_jobs=0


for ((i=1; i<=NUM_REQUESTS; i++)); do
  make_request "$i" &
  ((active_jobs++))

  # Limit the number of parallel jobs
  if ((active_jobs >= MAX_PARALLEL)); then
    wait -n  # Wait for at least one background job to finish
    ((active_jobs--))
  fi
done

wait

echo "All $NUM_REQUESTS queries completed."
