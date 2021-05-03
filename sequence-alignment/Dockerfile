FROM amazon/aws-lambda-nodejs:14.2021.04.26.13

COPY app.js package.json clustalo clustalOmega.js ./

RUN chmod +x ./clustalo

RUN npm install

# Command can be overwritten by providing a different command in the template directly.
CMD ["app.lambdaHandler"]
