
const https = require("https");

export class HttpClientService {
  constructor() {}

  googleAuthenticate(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'GET',
        hostname: 'www.googleapis.com',
        port: null,
        path: '/oauth2/v2/userinfo',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const req = https.request(options, function (res: any) {
        const chunks: Array<any> = [];

        res.on('data', function (chunk: any) {
          chunks.push(chunk);
        });

        res.on('end', function () {
          const body = Buffer.concat(chunks);

          resolve(body.toString());
        });
        req.on('error', (error: any) => {
          reject(error);
        });
      });

      req.end();
    });
  };

}
