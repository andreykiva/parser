const fs = require("fs");
const path = require("path");
const Excel = require("exceljs");

const saveProducts = async (products, title) => {
	const newFilename =
		title.replace(/ /g, "_") +
		"_" +
		new Date().toLocaleString().slice(-8).replace(/\:/g, "_").replace(/\ /g, "_") +
		".xlsx";

	fs.writeFileSync(path.join(__dirname, "..", "/tmp", newFilename), "");

	const workbook = new Excel.Workbook();
	const worksheet = workbook.addWorksheet("Sheet1");

	worksheet.columns = [
		{ header: "Порядковый номер", key: "id", width: 17 },
		{ header: "Название", key: "name", width: 100 },
		{ header: "Продавец", key: "seller", width: 40 },
		{ header: "Наличие", key: "presence", width: 40 },
		{ header: "Цена", key: "price", width: 15 },
		{ header: "Ссылка на товар", key: "link", width: 18 },
		{ header: "Дата", key: "date", width: 22 },
	];

	products.forEach((product, index) => {
		worksheet.addRow(product);
		worksheet.getCell("F" + (index + 2)).value = { text: "Ссылка", hyperlink: product.link, tooltip: product.link.slice(8) };
	});

	await workbook.xlsx.writeFile(path.join(__dirname, "..", "/tmp", newFilename));

	return newFilename;
};

module.exports = {
	saveProducts,
};
