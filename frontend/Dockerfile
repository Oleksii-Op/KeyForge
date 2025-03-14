ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY nginx.conf /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


FROM nginx:stable-bullseye

RUN apt-get update && apt-get install -y libprotobuf23

COPY otel_ngx_module.so /etc/nginx/otel_ngx_module.so

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 443
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
