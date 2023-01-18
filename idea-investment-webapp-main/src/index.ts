// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApplicationConfig} from '@loopback/core';
import * as dotenv from 'dotenv';
import {IdeaInvestmentNepalApplication} from './application';
export * from './application';
export {
  IdeaInvestmentNepalApplication,
  PackageInfo,
  PackageKey,
} from './application';
dotenv.config();

export async function main(options: ApplicationConfig = {}) {
  const app = new IdeaInvestmentNepalApplication(options);

  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.info(`Server is running at ${url}`);
  console.info(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      //port: 3103,
      port: process.env.PORT || 5000,
      host: process.env.HOST,
      disabled: true,
      apiExplorer: {
        disabled: true,
      },
      openApiSpec: {
        // disabled: true
        // useful when used with OASGraph to locate your application
        // setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
