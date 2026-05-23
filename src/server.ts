import app from "./app";
import { config } from "./config";

const main = () => {
  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
};

if (!process.env.VERCEL) {
  main();
}

export default app;
