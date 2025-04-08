ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

ENV VITE_API_BASE_URL=""

COPY nginx.conf /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
