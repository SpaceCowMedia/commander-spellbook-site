import https from "https";

export default function getData<T = unknown>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error("JSON payload from", url, "failed to parse.");
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}
