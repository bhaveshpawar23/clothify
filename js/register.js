const regForm = document.getElementById("registerForm");
const regName = document.getElementById("regName");
const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");
const regError = document.getElementById("registerError");
const googleBtn = document.getElementById("googleRegisterBtn");
const authContainer = document.querySelector(".auth-container");

const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

[regName, regEmail, regPassword].forEach(input => {
    input.addEventListener("focus", () => authContainer.classList.add("focus-border"));
    input.addEventListener("blur", () => {
        if (!regName.value && !regEmail.value && !regPassword.value) {
            authContainer.classList.remove("focus-border");
        }
    });
});

regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    regError.style.display = "none";
    const email = regEmail.value.trim();
    const password = regPassword.value.trim();
    const displayName = regName.value.trim();
    try {
        const userCred = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCred.user;
        await user.updateProfile({ displayName: displayName });
        await db.collection("users").doc(user.uid).set({
            uid: user.uid,
            email: email,
            displayName: displayName,
            photoURL: "",
            provider: "email",
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            loginCount: 1,
            cart: [],
            orders: []
        });
        window.location.href = "index.html";
    }
    catch (err) {
        regError.innerText = err.message;
        regError.style.display = "block";
    }
});

googleBtn.addEventListener("click", async () => {
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        const isNewUser = result.additionalUserInfo.isNewUser;
        if (isNewUser) {
            await db.collection("users").doc(user.uid).set({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || "Google User",
                photoURL: user.photoURL || "",
                provider: "google",
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                loginCount: 1,
                cart: [],
                orders: []
            });
        } else {
            await db.collection("users").doc(user.uid).update({
                email: user.email,
                displayName: user.displayName || "Google User",
                photoURL: user.photoURL || "",
                lastLogin: new Date().toISOString(),
                loginCount: firebase.firestore.FieldValue.increment(1)
            });
        }
        window.location.href = "index.html";
    }
    catch (err) {
        regError.innerText = err.message;
        regError.style.display = "block";
    }
});

