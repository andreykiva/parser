const normalizeUrl = (domain, url) => {
	const index = url.indexOf("?token");

	if (index !== -1) {
		return domain + url.slice(0, index);
	}

	return domain + url;
};

module.exports = {
	normalizeUrl,
};
