const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");

const generateAccessToken = (id, roles) => {
	const payload = { id, roles };

	return jwt.sign(payload, process.env.SECRET, { expiresIn: "24h" });
};

const createLogFile = (name) => {
	const newFilename =
		name +
		new Date()
			.toLocaleString()
			.replace(", ", "_")
			.replace(/\./g, "_")
			.replace(/\:/g, "_")
			.replace(/\//g, "_")
			.replace(/\ /g, "_") +
		".txt";

	return newFilename;
};

class AuthController {
	async registration(req, res) {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.json({ message: "Помилка під час реєстрації", errors });
			}

			const { login, password } = req.body;
			const candidate = await User.findOne({ login });
			if (candidate) {
				return res.json({
					messages: { login: "Такий користувач вже існує" },
				});
			}

			const hashPassword = bcrypt.hashSync(password, 7);
			const userRole = await Role.findOne({ value: "USER" });
			const user = new User({
				login,
				password: hashPassword,
				roles: [userRole.value],
			});
			await user.save();

			fs.writeFileSync(path.join(__dirname, "..", "/logs", `${login}.txt`), "");

			return res.status(200).json({ message: "Користувач успішно зареєстрований" });
		} catch (e) {
			console.log(e);
			res.json({ errorMessage: "Помилка реєстрації" });
		}
	}

	async login(req, res) {
		try {
			const { login, password } = req.body;

			const user = await User.findOne({ login });

			if (!user) {
				return res.json({ messages: { login: "Користувач не знайдений" } });
			}

			const validPassword = bcrypt.compareSync(password, user.password);

			if (!validPassword) {
				return res.json({
					messages: { password: "Введено неправильний пароль" },
				});
			}

			const token = generateAccessToken(user._id, user.roles);
			return res.json({ token, roles: user.roles, username: user.login });
		} catch (e) {
			console.log(e);
			res.json({ errorMessage: "Помилка входу" });
		}
	}

	async removeUser(req, res) {
		try {
			await User.findOneAndDelete({
				login: req.body.login,
			});

			return res.status(200).json({ message: "Користувача успішно видалено" });
		} catch (e) {
			console.log(e);
		}
	}

	async getUsers(req, res) {
		const users = await User.find();

		return res.json({ users });
	}

	getRoles(req, res) {
		const token = req.headers.authorization.split(" ")[1];

		const { roles } = jwt.verify(token, process.env.SECRET);

		return res.json({ roles });
	}

	getLogs(req, res) {
		const filenames = fs.readdirSync(path.join(__dirname, "..", "/logs"));

		const newFilename = createLogFile("logs_");
		let index = null;

		filenames.forEach((file, i) => {
			if (file.includes("logs")) {
				index = i;
			}
		});

		fs.rename(
			path.join(__dirname, "..", "/logs", filenames[index]),
			path.join(__dirname, "..", "/logs", newFilename),
			() => {
				return res.status(200).json({ filename: newFilename });
			}
		);
	}

	getUserLogs(req, res) {
		const user = req.params.user;

		const filenames = fs.readdirSync(path.join(__dirname, "..", "/logs"));
		const newFilename = createLogFile(user + "_");

		let includes = false;
		let index = null;

		filenames.forEach((file, i) => {
			if (file.includes(user)) {
				includes = true;
				index = i;
			}
		});

		if (includes) {
			fs.rename(
				path.join(__dirname, "..", "/logs", filenames[index]),
				path.join(__dirname, "..", "/logs", newFilename),
				() => {
					return res.status(200).json({ filename: newFilename });
				}
			);
		} else {
			fs.writeFileSync(path.join(__dirname, "..", "/logs", newFilename), "");
			return res.status(200).json({ filename: newFilename });
		}
	}
}

module.exports = new AuthController();
