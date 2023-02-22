import https from "https";

export default function post(rawUrl: string, data: unknown) {
  const url = new URL(rawUrl);
  const postBody = JSON.stringify(data);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postBody),
        },
      },
      (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          resolve(data);
        });
      }
    );

    req.on("error", reject);

    req.write(postBody);
    req.end();
  });
}
