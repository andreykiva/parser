const axios = require("axios");
const cheerio = require("cheerio");
const { normalizeUrl } = require("../helpers/normalizeUrl");

const parsePromPage = async (url) => {
	const products = [];

	try {
		const { data } = await axios.get(url);
		const $ = cheerio.load(data);

		const listItems = $(
			"div[data-qaid='product_gallery'] div[data-qaid='product_block']"
		);

		listItems.each((idx, el) => {
			const link = $(el).find("div a[data-qaid='product_link']").attr("href");
			const name = $(el).find("div span[data-qaid='product_name']").text();
			const price = $(el).find("span[data-qaid='product_price'] span").text();
			const presence = $(el).find("span[data-qaid='product_presence']").text();
			const seller = $(el)
				.find("button svg")
				.parent()
				.parent()
				.parent()
				.prev()
				.find("a")
				.text();

			const today = new Date();
			today.setHours(today.getHours() + 2);

			products.push({
				id: null,
				name,
				seller,
				presence,
				price: price.includes(".")
					? +price.slice(0, price.length / 2).replace(/ /g, "")
					: +price.replace(/ /g, ""),
				link: normalizeUrl("https://prom.ua", link),
				date: today.toLocaleString(),
				notes: "",
			});
		});

		return products;
	} catch (err) {
		console.error(err);
	}
};

const startProm = async (title, pages) => {
	const url = `https://prom.ua/ua/search?search_term=${title}&page=`;

	const { data } = await axios.get(url);
	const $ = cheerio.load(data);

	const categoryLink = $(
		"ul[data-qaid='category_tiles_block'] div[data-qaid='category_tile'] a"
	).attr("href");

	const categoryIndex = categoryLink.indexOf("category");
	let category = categoryLink.slice(categoryIndex);

	const listOfPromises = [];

	for (let i = 0; i < pages; i++) {
		listOfPromises.push(parsePromPage(`${url}${i + 1}&${category}`));
	}

	const productGroups = await Promise.all(listOfPromises);
	const products = productGroups.flat();

	const filteredProducts = [];

	products.forEach((item) => {
		const findedProduct = filteredProducts.find(
			(product) => product.link == item.link
		);

		if (!findedProduct) {
			filteredProducts.push(item);
		}
	});

	return filteredProducts;
};

const parseOlxPage = async (url) => {
	const products = [];

	try {
		const { data } = await axios.get(url);
		const $ = cheerio.load(data);

		const listItems = $("div[data-cy='l-card']");

		listItems.each((idx, el) => {
			const link = $(el).find("div > a").attr("href");
			const name = $(el).find("h6").text();
			let price = $(el).find("p[data-testid='ad-price']");
			const presence = "";
			const seller = "";

			if (price.text()) {
				const trimmedPrice = price
					.text()
					.slice(0, price.text().indexOf("грн."))
					.slice(-15);
				const index = trimmedPrice.indexOf(";}");

				if (index != -1) {
					price = trimmedPrice.slice(index + 2).replace(/ /g, "");
				} else {
					price = trimmedPrice.replace(/ /g, "");
				}
			} else {
				price = 0;
			}

			const today = new Date();
			today.setHours(today.getHours() + 2);

			products.push({
				id: null,
				name,
				seller,
				presence,
				price: isNaN(+price) ? 0 : +price,
				link: normalizeUrl("https://www.olx.ua", link),
				date: today.toLocaleString(),
				notes: "",
			});
		});

		return products;
	} catch (err) {
		console.error(err);
	}
};

const startOlx = async (title, pages) => {
	const url = `https://www.olx.ua/d/uk/q-${title}/?page=`;

	const listOfPromises = [];

	for (let i = 0; i < pages; i++) {
		if (i == 0) {
			listOfPromises.push(parseOlxPage(`${url}`));
		} else {
			listOfPromises.push(parseOlxPage(`${url}${i + 1}`));
		}
	}

	const productGroups = await Promise.all(listOfPromises);
	const products = productGroups.flat();

	const filteredProducts = [];

	products.forEach((item) => {
		const findedProduct = filteredProducts.find(
			(product) => product.link == item.link
		);

		if (!findedProduct) {
			filteredProducts.push(item);
		}
	});

	return filteredProducts;
};

module.exports = {
	startProm,
	startOlx,
};
