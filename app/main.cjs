const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const port = 3000;
const io = new Server(httpServer, {
	/* options */
});

app.get("/", (req, res) => {
	res.send("Hello World!");
});

httpServer.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
