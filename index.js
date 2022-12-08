const fs = require("fs");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const app = express();
const parseRouter = require("./routes/parseRouter");
const authRouter = require("./routes/authRouter");

const PORT = process.env.PORT || 8888;

app.use("/logs", express.static(path.join(__dirname, "/logs")));
app.use("/tmp", express.static(path.join(__dirname, "/tmp")));
app.use(express.static(__dirname + '/'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/api", parseRouter);
app.use("/api/auth", authRouter);

cron.schedule("59 59 23 * * *", () => {
	const directory = path.join(__dirname, "/tmp");

	fs.readdir(directory, (err, files) => {
		if (err) throw err;

		for (const file of files) {
			fs.unlink(path.join(directory, file), (err) => {
				if (err) throw err;
			});
		}
	});
});

const start = () => {
	try {
		mongoose.connect(process.env.MONGO_URI, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
		});

		const connection = mongoose.connection;

		connection.once("open", function () {
			console.log("MongoDB database connection established successfully");
		});

		app.listen(PORT, () => {
			console.log(`server started on port ${PORT}`);
		});
	} catch (e) {
		console.log(e);
	}
};

start();
