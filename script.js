// Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyBr5JzHhz0Lt-Wk-L-pH_kPz8lBuJfRUyA",
//     authDomain: "office-automation-9fc59.firebaseapp.com",
//     databaseURL: "https://office-automation-9fc59-default-rtdb.firebaseio.com",
//     projectId: "office-automation-9fc59",
//     storageBucket: "office-automation-9fc59.appspot.com",
//     messagingSenderId: "969334655990",
//     appId: "1:969334655990:web:e94c37a726f558823d15d7"
// };




/*
const firebaseConfig = {
    apiKey: "AIzaSyBR6JSbH5c2qXAy8IDzFQe84Ux-yBF6G-I",
    authDomain: "automation-4fc96.firebaseapp.com",
    databaseURL: "https://automation-4fc96-default-rtdb.firebaseio.com",
    projectId: "automation-4fc96",
    storageBucket: "automation-4fc96.firebasestorage.app",
    messagingSenderId: "818633473538",
    appId: "1:818633473538:web:7979f2fc1ab7ca8734f11b",
    measurementId: "G-Z6GQGCEQQ2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// Auto-login using device credentials
const email = "esp32.test.nexinnovation@gmail.com";
const password = "ESP32.test.NexInnovation.Automation";

console.log("🔐 Attempting Firebase authentication...");
auth.signInWithEmailAndPassword(email, password)
    .then(() => {
        console.log("✅ Firebase authenticated successfully.");
        initializeSwitches();
    })
    .catch((error) => {
        console.error("❌ Firebase login failed:", error.message);
        alert("Firebase login failed: " + error.message);
    });

function initializeSwitches() {
    const relays = ["r1", "r2", "r3", "r4", "r5", "r6"];
    const buttonIds = ["button1", "button2", "button3", "button4", "button5", "button6"];

    console.log("🔧 Initializing switch bindings...");

    relays.forEach((relay, index) => {
        const checkbox = document.getElementById(buttonIds[index]);
        const relayRef = database.ref(`main_office/${relay}`);

        console.log(`📡 Setting up listener for ${relay} → ${buttonIds[index]}`);

        // Reflect real-time changes from Firebase
        relayRef.on("value", (snapshot) => {
            console.log(`🔄 Firebase update received for ${relay}:`, snapshot.val());
            checkbox.checked = snapshot.val() === true;
        });

        // Update Firebase when toggle is clicked
        checkbox.addEventListener("change", () => {
            console.log(`🚨 Toggle changed → ${relay}:`, checkbox.checked);
            relayRef.set(checkbox.checked);
        });
    });
}

function checkControllerStatus() {
    firebase.database().ref("status/last_seen").once("value").then(snapshot => {
        const lastSeen = snapshot.val();
        const now = Math.floor(Date.now() / 1000); // current UNIX time in seconds
        const statusEl = document.getElementById("status-indicator");

        console.log("🕵️ Checking controller status...");
        console.log("📅 last_seen:", lastSeen, "| 📅 now:", now);

        if (!lastSeen) {
            statusEl.innerText = "Unknown";
            statusEl.style.color = "gray";
            console.warn("⚠️ No last_seen timestamp found.");
            return;
        }

        const delta = now - lastSeen;
        console.log("⏱️ Time delta (now - last_seen):", delta);

        if (delta < 30) {
            statusEl.innerText = "🟢 Online";
            statusEl.style.color = "green";
            console.log("✅ Controller is ONLINE.");
        } else if (delta < 50) {
            statusEl.innerText = "🟡 Weak Connection";
            statusEl.style.color = "orange";
            console.warn("⚠️ Controller in weak connection state.");
        } else {
            statusEl.innerText = "🔴 Offline";
            statusEl.style.color = "red";
            console.error("❌ Controller is OFFLINE.");
        }
    });
}

// Check every 5 seconds
setInterval(checkControllerStatus, 5000);
*/


/*
// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBR6JSbH5c2qXAy8IDzFQe84Ux-yBF6G-I",
    authDomain: "automation-4fc96.firebaseapp.com",
    databaseURL: "https://automation-4fc96-default-rtdb.firebaseio.com",
    projectId: "automation-4fc96",
    storageBucket: "automation-4fc96.firebasestorage.app",
    messagingSenderId: "818633473538",
    appId: "1:818633473538:web:7979f2fc1ab7ca8734f11b",
    measurementId: "G-Z6GQGCEQQ2"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

const email = "esp32.test.nexinnovation@gmail.com";
const password = "ESP32.test.NexInnovation.Automation";

console.log("🔐 Attempting Firebase authentication...");
auth.signInWithEmailAndPassword(email, password)
    .then(() => {
        console.log("✅ Firebase authenticated successfully.");
        initializeSwitches();
    })
    .catch((error) => {
        console.error("❌ Firebase login failed:", error.message);
        alert("Firebase login failed: " + error.message);
    });

function initializeSwitches() {
    const relays = ["r1", "r2", "r3", "r4", "r5", "r6"];
    const buttonIds = ["button1", "button2", "button3", "button4", "button5", "button6"];

    console.log("🔧 Initializing switch bindings...");

    relays.forEach((relay, index) => {
        const checkbox = document.getElementById(buttonIds[index]);
        const relayRef = database.ref(`main_office/${relay}`);

        console.log(`📡 Setting up listener for ${relay} → ${buttonIds[index]}`);

        relayRef.on("value", (snapshot) => {
            console.log(`🔄 Firebase update for ${relay}:`, snapshot.val());
            checkbox.checked = snapshot.val() === true;
        });

        checkbox.addEventListener("change", () => {
            console.log(`🚨 Toggle changed → ${relay}:`, checkbox.checked);
            relayRef.set(checkbox.checked);
        });
    });
}
*/

// async function checkControllerStatus() {
//     try {
//         const snapshot = await firebase.database().ref("status/last_seen").once("value");
//         const lastSeen = snapshot.val();
//         const now = Math.floor(Date.now() / 1000);
//         const statusEl = document.getElementById("status-indicator");

//         console.log("🕵️ Checking controller status...");
//         console.log("📅 last_seen:", lastSeen, "| 📅 now:", now);

//         if (!lastSeen) {
//             if (statusEl.innerText !== "Unknown") {
//                 statusEl.innerText = "Unknown";
//                 statusEl.style.color = "gray";
//             }
//             console.warn("⚠️ No last_seen timestamp found.");
//             return;
//         }

//         const delta = now - lastSeen;
//         console.log("⏱️ Time delta:", delta);

//         let text, color;

//         if (delta < 30) {
//             text = "🟢 Online";
//             color = "green";
//         } else if (delta < 50) {
//             text = "🟡 Weak Connection";
//             color = "orange";
//         } else {
//             text = "🔴 Offline";
//             color = "red";
//         }

//         if (statusEl.innerText !== text) {
//             statusEl.innerText = text;
//             statusEl.style.color = color;
//             console.log(`ℹ️ Controller status changed to: ${text}`);
//         }

//     } catch (error) {
//         console.error("❌ Error fetching controller status:", error.message);
//     }
// }

// // Periodic status check (runs in background)
// setInterval(checkControllerStatus, 5000);

/*
const firebaseConfig = {
    apiKey: "AIzaSyBR6JSbH5c2qXAy8IDzFQe84Ux-yBF6G-I",
    authDomain: "automation-4fc96.firebaseapp.com",
    databaseURL: "https://automation-4fc96-default-rtdb.firebaseio.com",
    projectId: "automation-4fc96",
    storageBucket: "automation-4fc96.firebasestorage.app",
    messagingSenderId: "818633473538",
    appId: "1:818633473538:web:7979f2fc1ab7ca8734f11b",
    measurementId: "G-Z6GQGCEQQ2"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

const email = "esp32.test.nexinnovation@gmail.com";
const password = "ESP32.test.NexInnovation.Automation";

// 🔒 Disable all buttons initially
const buttonIds = ["button1", "button2", "button3", "button4", "button5", "button6"];
buttonIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = true;
});

console.log("🔐 Attempting Firebase authentication...");
auth.signInWithEmailAndPassword(email, password)
    .then(() => {
        console.log("✅ Firebase authenticated successfully.");

        // 🔓 Enable all buttons after login
        buttonIds.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = false;
        });

        initializeSwitches();
    })
    .catch((error) => {
        console.error("❌ Firebase login failed:", error.message);
        alert("Firebase login failed: " + error.message);
    });

function initializeSwitches() {
    const relays = ["r1", "r2", "r3", "r4", "r5", "r6"];

    console.log("🔧 Initializing switch bindings...");

    relays.forEach((relay, index) => {
        const checkbox = document.getElementById(buttonIds[index]);
        const relayRef = database.ref(`main_office/${relay}`);

        console.log(`📡 Setting up listener for ${relay} → ${buttonIds[index]}`);

        // 🔄 Update checkbox if value changes in Firebase
        relayRef.on("value", (snapshot) => {
            const val = snapshot.val();
            console.log(`🔄 Firebase update for ${relay}:`, val);
            checkbox.checked = val === true;
        });

        // 🚨 Update Firebase when checkbox is toggled
        checkbox.addEventListener("change", () => {
            console.log(`🚨 Toggle changed → ${relay}:`, checkbox.checked);
            relayRef.set(checkbox.checked);
        });
    });
}

*/



const firebaseConfig = {
    apiKey: "AIzaSyBR6JSbH5c2qXAy8IDzFQe84Ux-yBF6G-I",
    authDomain: "automation-4fc96.firebaseapp.com",
    databaseURL: "https://automation-4fc96-default-rtdb.firebaseio.com",
    projectId: "automation-4fc96",
    storageBucket: "automation-4fc96.firebasestorage.app",
    messagingSenderId: "818633473538",
    appId: "1:818633473538:web:7979f2fc1ab7ca8734f11b",
    measurementId: "G-Z6GQGCEQQ2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// Firebase credentials
const email = "esp32.test.nexinnovation@gmail.com";
const password = "ESP32.test.NexInnovation.Automation";

// IDs of switches
const buttonIds = ["button1", "button2", "button3", "button4", "button5", "button6"];
const relays = ["r1", "r2", "r3", "r4", "r5", "r6"];

// 🔒 Disable switches on page load
buttonIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = true;
});

// 🔐 Authenticate Firebase
console.log("🔐 Attempting Firebase authentication...");
auth.signInWithEmailAndPassword(email, password)
    .then(() => {
        console.log("✅ Firebase authenticated successfully.");

        // 🔓 Enable switches
        buttonIds.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = false;
        });

        // ✅ Hide loading overlay
        document.getElementById("loadingOverlay").style.display = "none";

        // 🔄 Start syncing switches
        initializeSwitches();
    })
    .catch((error) => {
        console.error("❌ Firebase login failed:", error.message);
        alert("Firebase login failed: " + error.message);
    });

// 🔁 Function to bind Firebase relays with switches
function initializeSwitches() {
    console.log("🔧 Initializing switch bindings...");

    relays.forEach((relay, index) => {
        const checkbox = document.getElementById(buttonIds[index]);
        const relayRef = database.ref(`main_office/${relay}`);

        console.log(`📡 Setting up listener for ${relay} → ${buttonIds[index]}`);

        // 🔄 Sync from Firebase → UI
        relayRef.on("value", (snapshot) => {
            const val = snapshot.val();
            console.log(`📥 Firebase update for ${relay}:`, val);
            checkbox.checked = val === true;
        });

        // 🚀 Sync from UI → Firebase
        checkbox.addEventListener("change", () => {
            console.log(`📤 Toggled → ${relay}:`, checkbox.checked);
            relayRef.set(checkbox.checked);
        });
    });
}