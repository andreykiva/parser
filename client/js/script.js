const $themeBtn = document.querySelector(".js_theme_btn"),
	$logoBtns = document.querySelectorAll(".js_logo_btn"),
	$lessBtns = document.querySelectorAll(".js_less_btn"),
	$moreBtns = document.querySelectorAll(".js_more_btn"),
	$parseBtn = document.querySelector(".js_parse_btn"),
	$downloadBtn = document.querySelector(".js_download_btn"),
	$parseForm = document.querySelector(".js_parse_form"),
	$loader = document.querySelector(".js_loader"),
	$titleInput = document.querySelector(".js_title_input"),
	$pages = document.querySelectorAll(".js_page"),
	$headerLinks = document.querySelectorAll(".js_header_link"),
	$authForm = document.querySelector(".js_auth_form"),
	$authBtn = document.querySelector(".js_auth_btn"),
	$logoutBtn = document.querySelector(".js_logout_btn"),
	$parseLink = document.querySelector(".js_parse_link"),
	$createLink = document.querySelector(".js_create_link"),
	$removeLink = document.querySelector(".js_remove_link"),
	$createForm = document.querySelector(".js_create_form"),
	$createBtn = document.querySelector(".js_create_btn"),
	$usersList = document.querySelector(".js_users_list"),
	$loginInput = document.querySelector(".js_login_input"),
	$passwordInput = document.querySelector(".js_password_input"),
	$authLoginError = document.querySelector(".js_auth_login_error"),
	$authPasswordError = document.querySelector(".js_auth_password_error"),
	$createLoginInput = document.querySelector(".js_create_login_input"),
	$createPasswordInput = document.querySelector(".js_create_password_input"),
	$createLoginError = document.querySelector(".js_create_login_error"),
	$createPasswordError = document.querySelector(".js_create_password_error"),
	$openLogs = document.querySelector(".js_open_logs"),
	$promBox = document.querySelector(".js_prom_box"),
	$olxBox = document.querySelector(".js_olx_box");

$themeBtn.addEventListener("click", () => {
	document.body.classList.toggle("dark");
});

$logoBtns.forEach((btn) => {
	btn.addEventListener("click", () => {
		btn.parentElement.classList.toggle("active");
	});
});

$lessBtns.forEach((btn) => {
	btn.addEventListener("click", (e) => {
		e.preventDefault();

		const value = +btn.nextElementSibling.value;

		if (value > 1) {
			btn.nextElementSibling.value = value - 1;
		}
	});
});

$moreBtns.forEach((btn) => {
	btn.addEventListener("click", (e) => {
		e.preventDefault();

		const value = +btn.previousElementSibling.value;

		if (value < 25) {
			btn.previousElementSibling.value = value + 1;
		}
	});
});

const getData = (event) => {
	event.preventDefault();

	const token = localStorage.getItem("token");
	const username = localStorage.getItem("username");
	const formData = new FormData($parseForm);

	if (!formData.get("title")) {
		$titleInput.classList.add("invalid");
		return;
	}

	if (!$promBox.classList.contains("active") && !$olxBox.classList.contains("active")) {
		return;
	}

	$downloadBtn.classList.add("hide");
	$loader.classList.remove("hide");

	fetch("http://localhost:8888/api/parse", {
		method: "post",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: "Bearer " + token,
		},
		body: JSON.stringify({
			title: formData.get("title"),
			prom: $promBox.classList.contains("active"),
			olx: $olxBox.classList.contains("active"),
			promPages: formData.get("promPagesAmount"),
			olxPages: formData.get("olxPagesAmount"),
			username 
		}),
	})
		.then((res) => res.json())
		.then((data) => {
			if (data.message == "Success") {
				$downloadBtn.href = "http://localhost:8888/data/" + data.filename;
				$loader.classList.add("hide");
				$downloadBtn.classList.remove("hide");
			}
		});
};

const logout = () => {
	localStorage.removeItem("token");
	localStorage.removeItem("expirationDate");
	localStorage.removeItem("username");
	hidePages();
	hideLinks();
	$createForm.reset();
	$authForm.reset();

	$pages[1].classList.remove("hide");
};

const removeUser = (login) => {
	const token = localStorage.getItem("token");

	fetch("http://localhost:8888/api/auth/remove", {
		method: "delete",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: "Bearer " + token,
		},
		body: JSON.stringify({
			login: login,
		}),
	})
		.then((res) => res.json())
		.then((data) => {
			getUsers();
		});
};

const getUsers = () => {
	const token = localStorage.getItem("token");

	fetch("http://localhost:8888/api/auth/users", {
		method: "get",
		headers: {
			Authorization: "Bearer " + token,
		},
	})
		.then((res) => res.json())
		.then((data) => {
			$usersList.innerHTML = "";

			const filteredUsers = data.users.filter(
				(user) => !user.roles.includes("ADMIN")
			);

			if (!filteredUsers.length) {
				$usersList.insertAdjacentHTML(
					"beforeend",
					`
						<div class="users__list-item">
							<span class="username">Користувачів не знайдено</span>
						</div>	
						`
				);

				return;
			}

			filteredUsers.forEach((user) => {
				$usersList.insertAdjacentHTML(
					"beforeend",
					`
							<div class="users__list-item">
								<span class="username">${user.login}</span>
								<button class="remove-user-btn" onclick="removeUser('${user.login}')">Видалити</button>
							</div>	
							`
				);
			});
		});
};

const setInvalid = (input, error, text) => {
	input.classList.add("invalid");
	error.textContent = text;
};

$parseBtn.addEventListener("click", getData, false);

$titleInput.addEventListener("input", () => {
	$titleInput.classList.remove("invalid");
});

$logoutBtn.addEventListener("click", logout);

$authBtn.addEventListener("click", (e) => {
	e.preventDefault();

	const formData = new FormData($authForm);

	$loginInput.classList.remove("invalid");
	$passwordInput.classList.remove("invalid");

	let isValidLogin = true;
	let isValidPassword = true;

	if (!formData.get("login")) {
		setInvalid($loginInput, $authLoginError, "Логін не може бути пустим");
		isValidLogin = false;
	}

	if (!formData.get("password") || formData.get("password").length < 4) {
		setInvalid($passwordInput, $authPasswordError, "Пароль повинен бути більше 3-х");
		isValidPassword = false;
	}

	if (!isValidLogin || !isValidPassword) return;

	fetch("http://localhost:8888/api/auth/login", {
		method: "post",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			login: formData.get("login"),
			password: formData.get("password"),
		}),
	})
		.then((res) => res.json())
		.then((data) => {
			if (data.messages) {
				data.messages.login &&
					setInvalid($loginInput, $authLoginError, data.messages.login);
				data.messages.password &&
					setInvalid(
						$passwordInput,
						$authPasswordError,
						data.messages.password
					);
				return;
			} else if (data.errorMessage) return;

			const date = new Date();
			date.setDate(date.getDate() + 1);

			localStorage.setItem("token", data.token);
			localStorage.setItem("expirationDate", date);
			localStorage.setItem("username", data.username);

			if (!data.roles) return;

			if (data.roles.includes("ADMIN")) {
				setAdmin();
			} else if (data.roles.includes("USER")) {
				setUser();
			}
		});
});

$createBtn.addEventListener("click", (e) => {
	e.preventDefault();

	const formData = new FormData($createForm);

	$createLoginInput.classList.remove("invalid");
	$createPasswordError.classList.remove("invalid");

	let isValidLogin = true;
	let isValidPassword = true;

	if (!formData.get("login")) {
		setInvalid($createLoginInput, $createLoginError, "Логін не може бути пустим");
		isValidLogin = false;
	}

	if (!formData.get("password") || formData.get("password").length < 4) {
		setInvalid(
			$createPasswordInput,
			$createPasswordError,
			"Пароль повинен бути більше 3-х"
		);
		isValidPassword = false;
	}

	if (!isValidLogin || !isValidPassword) return;

	const token = localStorage.getItem("token");

	fetch("http://localhost:8888/api/auth/registration", {
		method: "post",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: "Bearer " + token,
		},
		body: JSON.stringify({
			login: formData.get("login"),
			password: formData.get("password"),
		}),
	})
		.then((res) => res.json())
		.then((data) => {

			console.log(data);
			if (data.messages) {
				data.messages.login &&
					setInvalid($createLoginInput, $createLoginError, data.messages.login);
				data.messages.password &&
					setInvalid(
						$createPasswordInput,
						$createPasswordError,
						data.messages.password
					);
				return;
			} else if (data.errorMessage) return;

			hidePages();
			getUsers();
			$pages[3].classList.remove("hide");
		});
});

$openLogs.addEventListener("click", (e) => {
	e.preventDefault();

	const token = localStorage.getItem("token");

	fetch("http://localhost:8888/api/auth/logs", {
		method: "get",
		headers: {
			Authorization: "Bearer " + token,
		},
	})
		.then((res) => res.json())
		.then((data) => {
			window.open(`http://localhost:8888/logs/${data.filename}`);
		});

});

$parseLink.addEventListener("click", () => {
	hidePages();
	$pages[0].classList.remove("hide");
});

$createLink.addEventListener("click", () => {
	hidePages();
	$createForm.reset();
	$pages[2].classList.remove("hide");
});

$removeLink.addEventListener("click", () => {
	hidePages();
	getUsers();
	$pages[3].classList.remove("hide");
});

const hidePages = () => {
	$pages.forEach((page) => {
		page.classList.add("hide");
	});
};

const hideLinks = () => {
	$headerLinks.forEach((link) => {
		link.classList.add("hide");
	});
};

const setAdmin = () => {
	hidePages();
	$parseLink.classList.remove("hide");
	$createLink.classList.remove("hide");
	$openLogs.classList.remove("hide");
	$removeLink.classList.remove("hide");
	$logoutBtn.classList.remove("hide");
	$pages[0].classList.remove("hide");
};

const setUser = () => {
	hidePages();
	$logoutBtn.classList.remove("hide");
	$pages[0].classList.remove("hide");
};

const getRoles = (token) => {
	fetch("http://localhost:8888/api/auth/roles", {
		headers: {
			Authorization: "Bearer " + token,
		},
	})
		.then((res) => res.json())
		.then((data) => {
			if (data.roles.includes("ADMIN")) {
				setAdmin();
			} else if (data.roles.includes("USER")) {
				setUser();
			}
		});
};

const start = () => {
	const expirationDate = localStorage.getItem("expirationDate");
	const token = localStorage.getItem("token");
	const username = localStorage.getItem("username");

	if (!token || !expirationDate || !username || new Date(expirationDate) <= new Date()) {
		logout();
	} else {
		getRoles(token);
	}
};

start();
