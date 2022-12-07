const fs = require("fs");
const reader = require("xlsx");

const saveProducts = (products, title) => {
	const ws = reader.utils.json_to_sheet(products);
	const newFilename = title.replace(/ /g, '_') + "_" + new Date().toLocaleString().slice(-8).replace(/\:/g, "_").replace(/\ /g, "_") + ".xlsx";

	fs.writeFileSync(`./tmp/${newFilename}`, "");

	const file = reader.readFile(`./tmp/${newFilename}`);

	ws["!cols"] = [
		{ wch: 17 },
		{ wch: 100 },
		{ wch: 40 },
		{ wch: 40 },
		{ wch: 15 },
		{ wch: 70 },
		{ wch: 22 },
	];

	products.forEach((product, index) => {
		ws["F" + (index + 2)].l = { Target: product["Ссылка на товар"] };
	});

	reader.utils.book_append_sheet(file, ws, "Sheet2");

	reader.writeFile(file, `./tmp/${newFilename}`);

	return newFilename;
};

module.exports = {
	saveProducts,
};
