const extension = require("./index.js");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();
const uploadImage = require("./uploadImage.js");

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_KEY = process.env.CLOUDFLARE_API_KEY;

describe("uploadImage", () => {
  it("pushes a file to the cloudflare images api", async () => {
    const fileBuffer = fs.readFileSync(
      path.resolve(__dirname, "..", "assets", "test-image.png")
    );
    const hashSum = crypto.createHash("sha256");
    hashSum.update(fileBuffer);
    const file = {
      type: "image/png",
      hash: hashSum.digest("hex"),
      ext: "png",
      buffer: fileBuffer,
    };

    try {
      const response = await uploadImage(file, ACCOUNT_ID, API_KEY);

      // update these expectations to be better
      expect(response.data.result).toBeTruthy();
      expect(response.data.result.id).toBeTruthy();
      expect(response.data.result.filename).toBeTruthy();
      expect(response.data.result.variants.length).toBeGreaterThan(0);
      expect(
        response.data.result.variants.find((variant) =>
          variant.endsWith("/cms")
        )
      ).toBeTruthy();
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
      }
      console.log(error.config);

      throw error;
    }
  });
});