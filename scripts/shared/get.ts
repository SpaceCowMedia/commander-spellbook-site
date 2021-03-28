import https from "https";

export default function getData(url: string) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          resolve(JSON.parse(data));
        });
      })
      .on("error", reject);
  });
}
