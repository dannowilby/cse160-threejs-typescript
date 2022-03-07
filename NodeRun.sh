
docker run --name homepage --rm -it --user "$(id -u):$(id -g)" -p 3000:3000 -v $PWD:/app -w /app node /bin/bash
