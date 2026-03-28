import { createServer } from "node:http";

const port = Number(process.env.WORKER_PORT ?? 3001);

const server = createServer((_request, response) => {
  response.writeHead(200, { "content-type": "application/json" });
  response.end(
    JSON.stringify({
      service: "worker",
      status: "ok",
      port,
      timestamp: new Date().toISOString(),
    }),
  );
});

server.listen(port, () => {
  console.log(
    JSON.stringify({
      event: "worker.started",
      port,
      timestamp: new Date().toISOString(),
    }),
  );
});
