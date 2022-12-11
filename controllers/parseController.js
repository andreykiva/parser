const fs = require("fs");
const path = require("path");
const transporter = require("../utils/email");
const Log = require("../models/Log");
const { startProm, startOlx } = require("../utils/parse");
const { saveProducts } = require("../utils/exel");
const telegram = require("../utils/telegram");

class parseController {
	async parseProducts(req, res) {
		try {
			const { title, promPages, olxPages, username, prom, olx } = req.body;
			let products = [];

			const today = new Date();
			today.setHours(today.getHours() + 2);

			const log = new Log({
				text: `Користувач ${username} зробив пошук "${title}" | ${today.toLocaleString()}`,
				user: username
			});

			await log.save();

			await telegram.sendMessage(
				process.env.ADMIN_ID,
				`Користувач ${username} зробив пошук "${title}"`
			);

			if (prom && olx) {
				const listOfPromises = [];

				listOfPromises.push(startProm(title, promPages));
				listOfPromises.push(startOlx(title, olxPages));

				const productGroups = await Promise.all(listOfPromises);
				products = productGroups.flat();
			} else if (prom) {
				const promProducts = await startProm(title, promPages);
				products = promProducts;
			} else if (olx) {
				const olxProducts = await startOlx(title, olxPages);
				products = olxProducts;
			}

			const sortedProducts = products.sort((a, b) => a.price - b.price);

			sortedProducts.forEach((item, index) => {
				item.id = index + 1;
			});

			const filename = await saveProducts(sortedProducts, title, username);

			await transporter.sendMail({
				to: process.env.RECEIVER_EMAIL,
				from: process.env.SENDER_EMAIL,
				subject: `${username} | "${title}"`,
				html: `
					<p>Користувач ${username} зробив пошук "${title}"</p>
					<hr />
				`,
				attachments: [
					{
						filename,
						path: path.join(__dirname, "..", "tmp", filename),
					},
				],
			});

			return res.status(200).json({
				filename,
				message: "Success",
			});
		} catch (e) {
			console.log(e);
		}
	}
}

module.exports = new parseController();
