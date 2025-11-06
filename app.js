import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase, ref, onValue, set, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// 🔧 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBR6JSbH5c2qXAy8IDzFQe84Ux-yBF6G-I",
  authDomain: "automation-4fc96.firebaseapp.com",
  databaseURL: "https://automation-4fc96-default-rtdb.firebaseio.com",
  projectId: "automation-4fc96",
  storageBucket: "automation-4fc96.firebasestorage.app",
  messagingSenderId: "818633473538",
  appId: "1:818633473538:web:7979f2fc1ab7ca8734f11b",
  measurementId: "G-Z6GQGCEQQ2",
};

// 🔐 Auth Credentials
const email = "esp32.test.nexinnovation@gmail.com";
const password = "ESP32.test.NexInnovation.Automation";

// ⚙️ Initialize Firebase
console.time("🔥 Firebase Init");
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
console.timeEnd("🔥 Firebase Init");

// 🌐 DOM Elements
const devicesDiv = document.getElementById("devices");
const userIcon = document.getElementById("user-icon");
const userPopup = document.getElementById("user-popup");

userIcon.addEventListener("click", () => userPopup.classList.toggle("hidden"));
document.addEventListener("click", (e) => {
  if (!userIcon.contains(e.target)) userPopup.classList.add("hidden");
});

let cachedDeviceNames = null;

// 🧩 Render single device card (fast)
function renderDeviceCard(deviceId, displayName, state) {
  const card = document.createElement("div");
  card.className = `device-card ${state ? "active" : ""}`;
  card.setAttribute("data-id", deviceId); // allow updating later
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

  card.onclick = () => {
    const newState = !checkbox.checked;
    checkbox.checked = newState;
    updateCardUI(card, newState);

    set(ref(db, "main_office/" + deviceId), newState)
      .then(() => console.log(`✅ ${deviceId} -> ${newState}`))
      .catch((err) => {
        console.error("❌ Firebase update failed:", err);
        checkbox.checked = !newState;
        updateCardUI(card, !newState);
      });
  };

  return card;
}

// 🧩 Update visual state
function updateCardUI(card, isOn) {
  card.classList.toggle("active", isOn);
  card.style.transform = "scale(0.97)";
  setTimeout(() => (card.style.transform = "scale(1)"), 100);
}

// 🧩 Render all devices quickly (uses cached names if available)
function showDevices(data) {
  console.time("💡 Render Devices");
  devicesDiv.innerHTML = "";
  const keys = Object.keys(data || {});
  keys.forEach((k) => {
    // Use cached name if present, otherwise use key (will be updated when names arrive)
    const name = (cachedDeviceNames && cachedDeviceNames[k]) || k.toUpperCase();
    devicesDiv.appendChild(renderDeviceCard(k, name, data[k]));
  });
  console.timeEnd("💡 Render Devices");
}

// 🧩 Watch device names and update DOM headers when available
function watchDeviceNames(defaultKeys) {
  console.time("🔧 Watch Device Names");
  const nameRef = ref(db, "config/device_names");
  const defaultNames = {
    r1: "Main Light 1",
    r2: "Main Light 2",
    r3: "Fan 1",
    r4: "Staff Light 1",
    r5: "Staff Light 2",
    r6: "Staff Fan",
  };

  onValue(nameRef, (snap) => {
    if (snap.exists()) {
      cachedDeviceNames = snap.val();
      // ensure defaults for any missing keys
      defaultKeys.forEach((key) => {
        if (!cachedDeviceNames[key]) cachedDeviceNames[key] = defaultNames[key];
      });
      // push back any filled defaults
      update(nameRef, cachedDeviceNames).catch((err) => {
        console.error("Failed to update device_names defaults:", err);
      });
    } else {
      cachedDeviceNames = defaultNames;
      set(nameRef, defaultNames).catch((err) => console.error("Failed to create device_names:", err));
    }

    // Update existing card headers in DOM
    Object.keys(cachedDeviceNames).forEach((devKey) => {
      const cardHeader = devicesDiv.querySelector(`.device-card[data-id="${devKey}"] .device-header`);
      if (cardHeader) {
        cardHeader.innerText = cachedDeviceNames[devKey];
      }
    });

    console.timeEnd("🔧 Watch Device Names");
  });
}

// 🧩 Load user info in background (after UI)
function loadUserData(userEmail) {
  console.time("👤 Load User Data");
  const userRef = ref(db, "config/userdata");

  // show placeholder immediately
  userPopup.querySelector("p:nth-child(1)").innerHTML = `<strong>Name:</strong> Loading...`;
  userPopup.querySelector("p:nth-child(2)").innerHTML = `<strong>Email:</strong> ${userEmail}`;

  onValue(userRef, (snap) => {
    let userData = snap.val();
    if (!userData) {
      userData = { email: userEmail, name: "NexInnovation Automation" };
      set(userRef, userData).catch((err) => console.error("Failed to create userdata:", err));
    } else {
      if (!userData.name) userData.name = "NexInnovation Automation";
      if (!userData.email) userData.email = userEmail;
      // if we filled defaults locally, push them back
      if (!snap.val().name || !snap.val().email) {
        update(userRef, { email: userData.email, name: userData.name }).catch((err) => {
          console.error("Failed to update userdata defaults:", err);
        });
      }
    }

    // update popup
    userPopup.querySelector("p:nth-child(1)").innerHTML = `<strong>Name:</strong> ${userData.name}`;
    userPopup.querySelector("p:nth-child(2)").innerHTML = `<strong>Email:</strong> ${userData.email}`;
    console.timeEnd("👤 Load User Data");
  });
}

// 🧩 Auth listener — render devices first, then start name/user watchers
onAuthStateChanged(auth, async (user) => {
  console.time("🚀 Dashboard Load Total");
  if (user) {
    console.log("✅ Logged in as:", user.email);

    // 1) Show devices immediately (fast render) using cached names if present
    const mainRef = ref(db, "main_office");
    onValue(mainRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();

        // Render quickly using cached names or fallback
        showDevices(data);

        // 2) Start watching device names (this will update headers in-place once ready)
        if (!cachedDeviceNames) watchDeviceNames(Object.keys(data));

        // 3) Load user data in background (popup updates when ready)
        loadUserData(user.email);
      } else {
        devicesDiv.innerHTML = "<p>No device data</p>";
      }
      console.timeEnd("🚀 Dashboard Load Total");
    });
  } else {
    console.time("🔐 Sign-in Process");
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        console.timeEnd("🔐 Sign-in Process");
        console.log("✅ Signed in successfully");
      })
      .catch((err) => console.error("❌ Login failed:", err));
  }
});
