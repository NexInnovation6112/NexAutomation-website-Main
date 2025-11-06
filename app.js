import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase, ref, onValue, set, get, child, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// 🌐 DOM elements
const devicesDiv = document.getElementById("devices");
const userEmailBox = document.getElementById("user-email");
const userIcon = document.getElementById("user-icon");
const userPopup = document.getElementById("user-popup");

userIcon.addEventListener("click", () => userPopup.classList.toggle("hidden"));
document.addEventListener("click", (e) => {
    if (!userIcon.contains(e.target)) userPopup.classList.add("hidden");
});

// 🧩 Load or create user info
async function loadUserData(userEmail) {
    const userRef = ref(db, "config/userdata");
    let userData = { email: userEmail, name: "NexInnovation Automation" };

    try {
        const snap = await get(userRef);
        if (snap.exists()) {
            const val = snap.val();
            userData.name = val.name || "NexInnovation Automation";
            userData.email = val.email || userEmail;
            if (!val.name || !val.email) await update(userRef, userData);
        } else await set(userRef, userData);

        userPopup.querySelector("p:nth-child(1)").innerHTML = `<strong>Name:</strong> ${userData.name}`;
        userPopup.querySelector("p:nth-child(2)").innerHTML = `<strong>Email:</strong> ${userData.email}`;
    } catch (err) {
        console.error("Error loading user data:", err);
    }
}

// 🧩 Load or create device names
async function loadDeviceNames(defaultKeys) {
    const nameRef = ref(db, "config/device_names");
    let names = {};
    const defaultNames = {
        r1: "Main Light 1",
        r2: "Main Light 2",
        r3: "Fan 1",
        r4: "Staff Light 1",
        r5: "Staff Light 2",
        r6: "Staff Fan"
    };

    try {
        const snap = await get(nameRef);
        if (snap.exists()) {
            names = snap.val();
            // Auto-fill missing ones
            defaultKeys.forEach((key) => {
                if (!names[key]) names[key] = defaultNames[key];
            });
            await update(nameRef, names);
        } else {
            names = defaultNames;
            await set(nameRef, names);
        }
    } catch (err) {
        console.error("Error loading device names:", err);
        names = defaultNames;
    }
    return names;
}

function renderDeviceCard(deviceId, displayName, state) {
    const card = document.createElement("div");
    card.className = `device-card ${state ? "active" : ""}`;
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

    // 🔥 Make the whole card clickable (including toggle)
    card.onclick = () => {
        const newState = !checkbox.checked;
        checkbox.checked = newState;
        updateCardUI(card, newState);

        // Async Firebase update
        set(ref(db, "main_office/" + deviceId), newState)
            .then(() => console.log(`${displayName} -> ${newState}`))
            .catch((err) => {
                alert("⚠️ Failed to update Firebase. Reverting.");
                checkbox.checked = !newState;
                updateCardUI(card, !newState);
            });
    };

    return card;
}

// Smooth instant UI update
function updateCardUI(card, isOn) {
    if (isOn) {
        card.classList.add("active");
    } else {
        card.classList.remove("active");
    }
    // tap feedback
    card.style.transform = "scale(0.97)";
    setTimeout(() => (card.style.transform = "scale(1)"), 100);
}



// 🧩 Show all devices
async function showDevices(data) {
    const deviceKeys = Object.keys(data);
    const deviceNames = await loadDeviceNames(deviceKeys);
    devicesDiv.innerHTML = "";
    deviceKeys.forEach((k) => {
        devicesDiv.appendChild(renderDeviceCard(k, deviceNames[k] || k.toUpperCase(), data[k]));
    });
}

// 🧩 Auth listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        await loadUserData(user.email);
        const mainRef = ref(db, "main_office");
        onValue(mainRef, (snap) => {
            if (snap.exists()) showDevices(snap.val());
            else devicesDiv.innerHTML = "<p>No device data</p>";
        });
    } else {
        signInWithEmailAndPassword(auth, email, password)
            .then(() => console.log("Signed in"))
            .catch((err) => console.error("Login failed:", err));
    }
});
