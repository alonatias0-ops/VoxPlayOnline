const STORAGE_KEY = "voxplay.users.v1";
const ACTIVE_KEY = "voxplay.activeUser.v1";
const RESET_ONCE_KEY = "voxplay.resetDone.v1";
const OWNER_USERNAME = "voxplay's admin";
const ADMIN_USERNAMES = new Set(["admin"]);
const SITE_NAME = "voxplayonline.com";

const routeLogin = document.getElementById("routeLogin");
const routeSignup = document.getElementById("routeSignup");
const routeMenu = document.getElementById("routeMenu");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const authMessage = document.getElementById("authMessage");
const accountCard = document.getElementById("accountCard");
const accountSummary = document.getElementById("accountSummary");
const accountAvatar = document.getElementById("accountAvatar");
const menuScreen = document.getElementById("menuScreen");
const menuWelcome = document.getElementById("menuWelcome");
const menuHandle = document.getElementById("menuHandle");
const menuCurrency = document.getElementById("menuCurrency");
const menuFriends = document.getElementById("menuFriends");
const menuGroups = document.getElementById("menuGroups");
const menuVisits = document.getElementById("menuVisits");
const logoutBtn = document.getElementById("logoutBtn");
const signupPassword = document.getElementById("signupPassword");
const passwordStrength = document.getElementById("passwordStrength");
const strengthBar = document.getElementById("strengthBar");
const toggleSignupPassword = document.getElementById("toggleSignupPassword");
const openSignupFromLogin = document.getElementById("openSignupFromLogin");
const backToLoginFromSignup = document.getElementById("backToLoginFromSignup");
const adminPanel = document.getElementById("adminPanel");
const adminTotalAccounts = document.getElementById("adminTotalAccounts");
const adminBannedAccounts = document.getElementById("adminBannedAccounts");
const adminAdminAccounts = document.getElementById("adminAdminAccounts");
const adminUserSelect = document.getElementById("adminUserSelect");
const adminCoinsAmount = document.getElementById("adminCoinsAmount");
const adminGiveCoinsBtn = document.getElementById("adminGiveCoinsBtn");
const adminBanToggleBtn = document.getElementById("adminBanToggleBtn");
const adminUserTableBody = document.getElementById("adminUserTableBody");
const shareLinkInput = document.getElementById("shareLinkInput");
const copyShareLinkBtn = document.getElementById("copyShareLinkBtn");
const nativeShareBtn = document.getElementById("nativeShareBtn");

let signupRouteUnlocked = false;

function normalizeUser(user) {
  const username = String(user?.username || "").trim().toLowerCase();
  const base = Array.from(username).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const coins = Number(user?.voxCoins);
  const role = username === OWNER_USERNAME ? "owner" : ADMIN_USERNAMES.has(username) ? "admin" : "user";

  return {
    ...user,
    username,
    email: String(user?.email || "").trim().toLowerCase(),
    role,
    banned: Boolean(user?.banned),
    voxCoins: Number.isFinite(coins) ? coins : 150 + (base % 850),
  };
}

function isAdmin(user) {
  return Boolean(user && (user.role === "admin" || user.role === "owner"));
}

function getActiveUser() {
  try {
    const stored = JSON.parse(localStorage.getItem(ACTIVE_KEY));
    return stored ? normalizeUser(stored) : null;
  } catch {
    return null;
  }
}

function getUsers() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(parsed)) {
      return [];
    }
    const normalized = parsed.map(normalizeUser);
    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      saveUsers(normalized);
    }
    return normalized;
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function setMessage(text, isError = false) {
  authMessage.textContent = text;
  authMessage.classList.toggle("error", isError);
  authMessage.classList.toggle("success", !isError && text.length > 0);
}

function validateSignup(formData) {
  if (!formData.username || formData.username.length < 3) {
    return "Name must be at least 3 characters.";
  }

  if (!formData.password || formData.password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  if (!formData.email || !String(formData.email).includes("@")) {
    return "Please enter a valid email.";
  }

  if (formData.captcha !== "on") {
    return "Please complete the captcha checkbox.";
  }

  return "";
}

function getStrength(password) {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { text: "Strength: too weak", className: "weak", width: "20%" };
  if (score <= 3) return { text: "Strength: medium", className: "medium", width: "62%" };
  return { text: "Strength: strong", className: "strong", width: "100%" };
}

function updateStrengthUi(password) {
  const strength = getStrength(password);
  passwordStrength.textContent = strength.text;
  strengthBar.className = `strength-fill ${strength.className}`;
  strengthBar.style.width = strength.width;
}

function getShareUrl() {
  return `${location.origin}${location.pathname}`;
}

function updateShareUi() {
  if (shareLinkInput) {
    shareLinkInput.value = getShareUrl();
  }

  if (nativeShareBtn) {
    nativeShareBtn.disabled = typeof navigator.share !== "function";
  }
}

function showLoggedIn(user) {
  const currentUser = normalizeUser(user);
  accountCard.classList.remove("hidden");
  menuScreen.classList.remove("hidden");
  routeMenu.classList.remove("hidden");
  accountSummary.textContent = `${currentUser.username} (${currentUser.email}) • ${currentUser.role}.`;
  menuWelcome.textContent = `Welcome back, ${currentUser.username}.`;

  const base = Array.from(currentUser.username || "").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  if (menuHandle) menuHandle.textContent = `@${currentUser.username}`;
  if (menuCurrency) menuCurrency.textContent = String(currentUser.voxCoins || 0);
  if (menuFriends) menuFriends.textContent = String(3 + (base % 25));
  if (menuGroups) menuGroups.textContent = String(1 + (base % 7));
  if (menuVisits) menuVisits.textContent = String(250 + (base % 7000));
  accountAvatar.src = "";
  accountAvatar.classList.add("hidden");
  renderAdminPanel(currentUser);
}

function setActiveUser(user) {
  const normalized = normalizeUser(user);
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(normalized));
  showLoggedIn(normalized);
  location.hash = "#menu";
}

function clearActiveUser() {
  localStorage.removeItem(ACTIVE_KEY);
  accountCard.classList.add("hidden");
  menuScreen.classList.add("hidden");
  routeMenu.classList.add("hidden");
  accountSummary.textContent = "";
  menuWelcome.textContent = "";
  if (menuHandle) menuHandle.textContent = "@player";
  if (menuCurrency) menuCurrency.textContent = "0";
  if (menuFriends) menuFriends.textContent = "0";
  if (menuGroups) menuGroups.textContent = "0";
  if (menuVisits) menuVisits.textContent = "0";
  accountAvatar.src = "";
  accountAvatar.classList.add("hidden");
  if (adminPanel) adminPanel.classList.add("hidden");
  updateShareUi();
}

function selectedManageUser(users) {
  if (!adminUserSelect) return null;
  const selected = String(adminUserSelect.value || "").toLowerCase();
  return users.find((user) => user.username === selected) || null;
}

function renderAdminPanel(activeUser) {
  if (!adminPanel) return;
  const canManage = isAdmin(activeUser);
  adminPanel.classList.toggle("hidden", !canManage);
  if (!canManage) return;

  const users = getUsers();
  const manageable = users.filter((user) => !isAdmin(user));
  const selectedBefore = adminUserSelect ? String(adminUserSelect.value || "") : "";

  if (adminTotalAccounts) adminTotalAccounts.textContent = String(users.length);
  if (adminBannedAccounts) adminBannedAccounts.textContent = String(users.filter((user) => user.banned).length);
  if (adminAdminAccounts) adminAdminAccounts.textContent = String(users.filter((user) => isAdmin(user)).length);

  if (adminUserSelect) {
    adminUserSelect.innerHTML = "";
    manageable.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.username;
      option.textContent = `@${user.username}`;
      adminUserSelect.append(option);
    });

    if (manageable.length > 0) {
      const hasPrevious = manageable.some((user) => user.username === selectedBefore);
      adminUserSelect.value = hasPrevious ? selectedBefore : manageable[0].username;
    }
  }

  const selectedUser = selectedManageUser(manageable);
  if (adminBanToggleBtn) {
    adminBanToggleBtn.textContent = selectedUser?.banned ? "Unban User" : "Ban User";
    adminBanToggleBtn.disabled = manageable.length === 0;
  }
  if (adminGiveCoinsBtn) {
    adminGiveCoinsBtn.disabled = manageable.length === 0;
  }

  if (adminUserTableBody) {
    adminUserTableBody.innerHTML = "";
    users.forEach((user) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>@${user.username}</td><td>${user.email || "-"}</td><td>${user.voxCoins}</td><td>${user.banned ? "Banned" : "Active"}</td>`;
      adminUserTableBody.append(row);
    });
  }
}

function switchRoute(route) {
  const activeUser = getActiveUser();
  let safeRoute = route;

  if (activeUser) {
    safeRoute = "menu";
  } else if (route === "menu") {
    safeRoute = "login";
  } else if (route === "signup" && !signupRouteUnlocked) {
    safeRoute = "login";
  }

  const loginActive = safeRoute === "login";
  const signupActive = safeRoute === "signup";
  const menuActive = safeRoute === "menu";

  routeLogin.classList.toggle("active", loginActive);
  routeSignup.classList.toggle("active", signupActive);
  routeMenu.classList.toggle("active", menuActive);

  loginForm.classList.toggle("hidden", !loginActive);
  signupForm.classList.toggle("hidden", !signupActive);
  accountCard.classList.toggle("hidden", !menuActive || !activeUser);
  menuScreen.classList.toggle("hidden", !menuActive || !activeUser);

  if (safeRoute !== route) {
    location.hash = `#${safeRoute}`;
  }

  if (safeRoute !== "signup") {
    signupRouteUnlocked = false;
  }

  setMessage("");
}

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = Object.fromEntries(new FormData(signupForm).entries());
  formData.username = String(formData.username || "").trim().toLowerCase();
  formData.email = String(formData.email || "").trim().toLowerCase();

  const validationError = validateSignup(formData);
  if (validationError) {
    setMessage(validationError, true);
    return;
  }

  const users = getUsers();
  const usernameTaken = users.some((user) => user.username === formData.username);
  if (usernameTaken) {
    setMessage("That username is already taken.", true);
    return;
  }

  const user = {
    username: formData.username,
    email: formData.email,
    password: formData.password,
    voxCoins: 150,
    banned: false,
  };

  users.push(user);
  saveUsers(users);
  setActiveUser(user);
  setMessage("Account created successfully.");
  signupForm.reset();
  updateStrengthUi("");
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(loginForm).entries());
  const username = String(formData.username || "").trim().toLowerCase();
  const password = String(formData.password || "");

  const users = getUsers();
  const foundUser = users.find((user) => user.username === username && user.password === password);

  if (!foundUser) {
    setMessage("Invalid username or password.", true);
    return;
  }

  if (foundUser.banned) {
    setMessage("This account is banned.", true);
    return;
  }

  setActiveUser(foundUser);
  setMessage(`Welcome back, ${foundUser.username}.`);
  loginForm.reset();
});

logoutBtn.addEventListener("click", () => {
  clearActiveUser();
  location.hash = "#login";
  setMessage("You have been logged out.");
});

signupPassword.addEventListener("input", () => {
  updateStrengthUi(signupPassword.value);
});

if (toggleSignupPassword) {
  toggleSignupPassword.addEventListener("click", () => {
    const isPassword = signupPassword.type === "password";
    signupPassword.type = isPassword ? "text" : "password";
    toggleSignupPassword.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
  });
}

if (openSignupFromLogin) {
  openSignupFromLogin.addEventListener("click", () => {
    signupRouteUnlocked = true;
    location.hash = "#signup";
  });
}

if (backToLoginFromSignup) {
  backToLoginFromSignup.addEventListener("click", () => {
    signupRouteUnlocked = false;
    location.hash = "#login";
  });
}

if (adminUserSelect) {
  adminUserSelect.addEventListener("change", () => {
    const activeUser = getActiveUser();
    if (!activeUser) return;
    renderAdminPanel(activeUser);
  });
}

if (adminGiveCoinsBtn) {
  adminGiveCoinsBtn.addEventListener("click", () => {
    const activeUser = getActiveUser();
    if (!isAdmin(activeUser)) return;

    const users = getUsers();
    const selectedUser = selectedManageUser(users.filter((user) => !isAdmin(user)));
    const amount = Number(adminCoinsAmount?.value || 0);

    if (!selectedUser) {
      setMessage("No user selected to receive coins.", true);
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("Enter a valid coin amount.", true);
      return;
    }

    const target = users.find((user) => user.username === selectedUser.username);
    if (!target) return;

    target.voxCoins += Math.floor(amount);
    saveUsers(users);
    setMessage(`Added ${Math.floor(amount)} Vox coins to @${target.username}.`);
    renderAdminPanel(activeUser);
  });
}

if (adminBanToggleBtn) {
  adminBanToggleBtn.addEventListener("click", () => {
    const activeUser = getActiveUser();
    if (!isAdmin(activeUser)) return;

    const users = getUsers();
    const selectedUser = selectedManageUser(users.filter((user) => !isAdmin(user)));
    if (!selectedUser) {
      setMessage("No user selected for moderation.", true);
      return;
    }

    const target = users.find((user) => user.username === selectedUser.username);
    if (!target) return;

    target.banned = !target.banned;
    saveUsers(users);
    setMessage(target.banned ? `@${target.username} has been banned.` : `@${target.username} has been unbanned.`);
    renderAdminPanel(activeUser);
  });
}

if (copyShareLinkBtn) {
  copyShareLinkBtn.addEventListener("click", async () => {
    const shareUrl = getShareUrl();

    try {
      await navigator.clipboard.writeText(shareUrl);
      if (shareLinkInput) {
        shareLinkInput.value = shareUrl;
        shareLinkInput.select();
      }
      setMessage("Share link copied.");
    } catch {
      setMessage("Could not copy the link automatically.", true);
    }
  });
}

if (nativeShareBtn) {
  nativeShareBtn.addEventListener("click", async () => {
    if (typeof navigator.share !== "function") {
      setMessage("Sharing is not supported in this browser.", true);
      return;
    }

    try {
      await navigator.share({
        title: SITE_NAME,
        text: `Join me on ${SITE_NAME}`,
        url: getShareUrl(),
      });
      setMessage("Share menu opened.");
    } catch (error) {
      if (error && error.name === "AbortError") {
        return;
      }
      setMessage("Could not open the share menu.", true);
    }
  });
}

[routeLogin, routeSignup, routeMenu].forEach((routeBtn) => {
  if (!routeBtn) return;
  routeBtn.addEventListener("click", (event) => {
    event.preventDefault();
    if (getActiveUser()) {
      setMessage("Use Log Out to leave the menu.", true);
      location.hash = "#menu";
      return;
    }
    setMessage("Use the form buttons to move between login and create account.", true);
    location.hash = "#login";
  });
});

function routeFromHash() {
  if (location.hash === "#signup") return "signup";
  if (location.hash === "#menu") return "menu";
  return "login";
}

window.addEventListener("hashchange", () => {
  switchRoute(routeFromHash());
});

(function initialize() {
  if (!localStorage.getItem(RESET_ONCE_KEY)) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_KEY);
    localStorage.setItem(RESET_ONCE_KEY, "1");
  }

  updateStrengthUi("");
  updateShareUi();

  const activeUser = getActiveUser();
  if (activeUser && activeUser.username) {
    const users = getUsers();
    const latest = users.find((user) => user.username === activeUser.username);
    if (!latest || latest.banned) {
      clearActiveUser();
      location.hash = "#login";
      switchRoute("login");
      setMessage("Your session ended. Please log in again.", true);
      return;
    }

    showLoggedIn(latest);
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(latest));
    location.hash = "#menu";
    switchRoute("menu");
    setMessage(`Still logged in as ${activeUser.username}.`);
    return;
  }

  location.hash = "#login";
  switchRoute("login");
})();
