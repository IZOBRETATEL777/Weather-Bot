import { serve } from "bun";

const server = serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello, World!", {
      headers: { "Content-Type": "text/plain" },
    });
  },
});

console.log(`Server running at http://localhost:3000`);

