const fs = require("fs");
const path = require("path");
const { startProm, startOlx } = require("../utils/parse");
const { saveProducts } = require("../utils/exel");

class parseController {
	async parseProducts(req, res) {
		try {
			const { title, promPages, olxPages, username, prom, olx } = req.body;
			let products = [];

			const files = fs.readdirSync(path.join(__dirname, "..", "/logs"));

			console.log(files[0]);

			fs.appendFileSync(
				path.join(__dirname, "..", "/logs", files[0]),
				`Користувач ${username} зробив пошук "${title}" | ${new Date().toLocaleString()}\n`
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

			const sortedProducts = products.sort((a, b) => a["Цена"] - b["Цена"]);

			sortedProducts.forEach((item, index) => {
				item["Порядковый номер"] = index + 1;
			});

			const filename = saveProducts(sortedProducts, title);

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
