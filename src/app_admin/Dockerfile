FROM public.ecr.aws/lambda/nodejs:18 as builder
WORKDIR /app

ARG CLOUD_FRONT_DOMAIN
RUN touch .env.production
RUN echo "CLOUD_FRONT_DOMAIN=$CLOUD_FRONT_DOMAIN" >> .env.production
RUN cat .env.production

COPY . .
RUN npm update && npm run build

FROM public.ecr.aws/lambda/nodejs:18 as runner
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.7.1 /lambda-adapter /opt/extensions/lambda-adapter

ENV PORT=3000 NODE_ENV=production

WORKDIR ${LAMBDA_TASK_ROOT}

COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

COPY --from=builder /app/.next/standalone ./

ENTRYPOINT ["node"]
CMD ["server.js"]