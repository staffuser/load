import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { createServer as createViteServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));


async function createServer() {
  const app = express();

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use(vite.middlewares);


  app.use("/unicorns", (req, res) => {
    if (fs.existsSync(path.resolve(__dirname, "unicorns"))) {
      fs.unlinkSync(path.resolve(__dirname, "unicorns"));
    }

    const stream = fs.createWriteStream(
      path.resolve(__dirname, "unicorns")
    );

    req.pipe(stream);
    req.on("data", console.log);

    req.on("end", () => {
      res.send("thanks!");
      stream.close();
    });
  });

  app.use("*", async (_, res) => {
    let template = fs.readFileSync(
      path.resolve(__dirname, "index.html"),
      "utf-8"
    );

    template = await vite.transformIndexHtml("/", template);
    res.setHeader("Content-Type", "text/html");
    res.send(template);
  });

  app.listen(5173, () => {
    console.log("go to", "http://localhost:5173");
  });
}

createServer();
