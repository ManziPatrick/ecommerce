const http = require("http");
const app = require("express")();

app.use(require("cors")());
app.use(require("express").json());

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Basic server working" });
});

app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy",
    services: { 
      server: "running",
      stripe: "disabled",
      database: "disabled"
    }
  });
});

const server = http.createServer(app);
const PORT = 5001;

server.listen(PORT, () => {
  console.log(`✅ Basic server running on http://localhost:${PORT}`);
  console.log("This proves Node.js/Express works");
  
  setTimeout(() => {
    console.log("Test complete. Press Ctrl+C to stop.");
  }, 30000);
});
