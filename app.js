import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  update,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

/* 🔧 Firebase Config */
const firebaseConfig = {
  apiKey: "AIzaSyBR6JSbH5c2qXAy8IDzFQe84Ux-yBF6G-I",
  authDomain: "automation-4fc96.firebaseapp.com",
  databaseURL: "https://automation-4fc96-default-rtdb.firebaseio.com",
  projectId: "automation-4fc96",
  storageBucket: "automation-4fc96.firebasestorage.app",
  messagingSenderId: "818633473538",
  appId: "1:818633473538:web:7979f2fc1ab7ca8734f11b",
};

/* 🧩 Auth Credentials */
const email = "esp32.test.nexinnovation@gmail.com";
const password = "ESP32.test.NexInnovation.Automation";

/* ⚙️ Initialize Firebase */
console.time("🔥 Firebase Init");
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
console.timeEnd("🔥 Firebase Init");

/* 🌐 DOM Elements */
const devicesDiv = document.getElementById("devices");
let cachedDeviceNames = null;
let deviceListenersActive = false;

/* 🧩 Render Device Card */
function renderDeviceCard(deviceId, displayName, state, index = 0) {
  const card = document.createElement("div");
  card.className = `device-card ${state ? "active" : ""}`;
  card.setAttribute("data-id", deviceId);
  card.style.animationDelay = `${index * 0.05}s`;

  card.innerHTML = `
    <div class="device-header">${displayName}</div>
    <div class="device-body">
      <label class="toggle">
        <input type="checkbox" ${state ? "checked" : ""}>
        <span class="slider"></span>
      </label>
    </div>
  `;

  const checkbox = card.querySelector("input");
  checkbox.addEventListener("click", (e) => e.stopPropagation());
  card.addEventListener("click", () => {
    const newState = !checkbox.checked;
    checkbox.checked = newState;
    updateCardUI(card, newState);
    set(ref(db, "main_office/" + deviceId), newState).catch(console.error);
  });

  return card;
}

/* 💡 Smooth UI Update */
function updateCardUI(card, isOn) {
  card.classList.toggle("active", isOn);
  card.style.transform = "scale(0.97)";
  setTimeout(() => (card.style.transform = "scale(1)"), 100);
}

/* 💡 Render Devices */
function showDevices(data) {
  devicesDiv.innerHTML = "";
  Object.entries(data || {}).forEach(([id, val], i) => {
    const name = cachedDeviceNames?.[id] || id.toUpperCase();
    devicesDiv.appendChild(renderDeviceCard(id, name, val, i));
  });

  // Fade in devices
  devicesDiv.classList.add("loaded");
  document.getElementById("loading-text")?.remove();
}

/* ⚡ Update Existing Cards */
function updateDeviceStates(data) {
  Object.entries(data).forEach(([id, value]) => {
    const card = devicesDiv.querySelector(`.device-card[data-id="${id}"]`);
    if (card) {
      const checkbox = card.querySelector("input");
      if (checkbox && checkbox.checked !== value) {
        checkbox.checked = value;
        updateCardUI(card, value);
      }
    } else {
      devicesDiv.appendChild(renderDeviceCard(id, id, value));
    }
  });
}

/* 🧩 Watch Device Names */
function watchDeviceNames(defaultKeys) {
  const nameRef = ref(db, "config/device_names");
  const defaultNames = {
    r1: "Main Light 1",
    r2: "Main Light 2",
    r3: "Fan 1",
    r4: "Staff Light 1",
    r5: "Staff Light 2",
    r6: "Staff Fan",
  };

  const cached = sessionStorage.getItem("deviceNames");
  if (cached) {
    cachedDeviceNames = JSON.parse(cached);
    updateCardHeaders(cachedDeviceNames);
  }

  onValue(nameRef, (snap) => {
    if (snap.exists()) {
      cachedDeviceNames = snap.val();
      defaultKeys.forEach((key) => {
        if (!cachedDeviceNames[key]) cachedDeviceNames[key] = defaultNames[key];
      });
    } else {
      cachedDeviceNames = defaultNames;
      set(nameRef, defaultNames);
    }

    updateCardHeaders(cachedDeviceNames);
    sessionStorage.setItem("deviceNames", JSON.stringify(cachedDeviceNames));
  });
}

/* 💬 Update Headers */
function updateCardHeaders(names) {
  Object.keys(names).forEach((devKey) => {
    const cardHeader = devicesDiv.querySelector(
      `.device-card[data-id="${devKey}"] .device-header`
    );
    if (cardHeader) cardHeader.innerText = names[devKey];
  });
}

/* 🚀 Main Load Logic */
function startDashboard() {
  console.time("🚀 Dashboard Load");
  const mainRef = ref(db, "main_office");

  // ⚡ Show cached data instantly if available
  const cachedData = localStorage.getItem("cachedMainOfficeData");
  if (cachedData && !deviceListenersActive) {
    const data = JSON.parse(cachedData);
    console.log("⚡ Showing cached devices instantly...");
    showDevices(data);
    deviceListenersActive = true;
  }

  // 🔄 Live updates from Firebase
  onValue(mainRef, (snap) => {
    if (!snap.exists()) {
      devicesDiv.innerHTML = "<p>No device data</p>";
      return;
    }

    const data = snap.val();

    // ✅ Save latest snapshot
    localStorage.setItem("cachedMainOfficeData", JSON.stringify(data));

    if (!deviceListenersActive) {
      showDevices(data);
      deviceListenersActive = true;
      watchDeviceNames(Object.keys(data));
    } else {
      updateDeviceStates(data);
    }

    console.timeEnd("🚀 Dashboard Load");
  });
}

/* ⚙️ Auth Handling — Cached Session + Persistent Login */
setPersistence(auth, browserLocalPersistence).then(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("✅ Using cached login:", user.email);
      startDashboard();
    } else {
      console.log("🔐 Logging in with credentials...");
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          console.log("✅ Login success, starting dashboard...");
          startDashboard();
        })
        .catch((err) => {
          console.error("❌ Login failed:", err);
          devicesDiv.innerHTML =
            "<p>Login failed. Check network or credentials.</p>";
        });
    }
  });
});
