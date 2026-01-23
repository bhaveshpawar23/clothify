const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");
const googleBtn = document.getElementById("googleLoginBtn");
const authContainer = document.querySelector(".auth-container");

const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

[loginEmail, loginPassword].forEach(input => {
    input.addEventListener("focus", () => {
        authContainer.classList.add("focus-border");
    });
    input.addEventListener("blur", () => {
        if (!loginEmail.value && !loginPassword.value) {
            authContainer.classList.remove("focus-border");
        }
    });
});

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    loginError.style.display = "none";
    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        const user = result.user;
        await db.collection("users").doc(user.uid).update({
            lastLogin: new Date().toISOString(),
            loginCount: firebase.firestore.FieldValue.increment(1)
        });
        window.location.href = "index.html";
    }
    catch (err) {
        loginError.innerText = err.message;
        loginError.style.display = "block";
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
                loginCount: 1
            });
        } else {
            await db.collection("users").doc(user.uid).update({
                email: user.email,
                displayName: user.displayName || user.email,
                lastLogin: new Date().toISOString(),
                loginCount: firebase.firestore.FieldValue.increment(1)
            });
        }
        window.location.href = "index.html";
    }
    catch (err) {
        loginError.innerText = err.message;
        loginError.style.display = "block";
    }
});

