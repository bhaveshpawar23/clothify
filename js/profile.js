const auth = firebase.auth();
const db = firebase.firestore();

const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const infoFullName = document.getElementById("infoFullName");
const infoEmail = document.getElementById("infoEmail");
const infoJoined = document.getElementById("infoJoined");
const cartCount = document.getElementById("cartCount");
const logoutBtn = document.getElementById("logoutBtn");
const editProfileBtn = document.getElementById("editProfileBtn");
const ordersList = document.getElementById("orders-list");
const noOrdersMsg = document.getElementById("noOrdersMsg");

window.addEventListener("DOMContentLoaded", () => {
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = "login.html";
            return;
        }
        try {
            const userDoc = await db.collection("users").doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                userName.textContent = userData.displayName || user.email;
                userEmail.textContent = userData.email || user.email;
                infoFullName.textContent = userData.displayName || "—";
                infoEmail.textContent = userData.email || "—";
                if (userData.createdAt) {
                    const joinDate = new Date(userData.createdAt);
                    infoJoined.textContent = joinDate.toLocaleDateString();
                } else {
                    infoJoined.textContent = "—";
                }
                if (userData.photoURL) {
                    userPhoto.src = userData.photoURL;
                } else {
                    userPhoto.src = "assets/default-user.png";
                }
                if (userData.orders && userData.orders.length > 0) {
                    noOrdersMsg.style.display = "none";
                    ordersList.innerHTML = "";
                    userData.orders.forEach((order, index) => {
                        const orderEl = document.createElement("div");
                        orderEl.className = "order-item";
                        orderEl.innerHTML = `
                            <p><strong>Order #${index + 1}</strong> - ₹${order.total || 0}</p>
                            <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
                        `;
                        ordersList.appendChild(orderEl);
                    });
                } else {
                    noOrdersMsg.style.display = "block";
                    ordersList.innerHTML = "";
                }
            } else {
                userName.textContent = user.email || "User";
                userEmail.textContent = user.email || "—";
                infoFullName.textContent = user.displayName || "—";
                infoEmail.textContent = user.email || "—";
                infoJoined.textContent = "—";
            }
            const cartKey = "clothify_cart";
            const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
            const count = cart.reduce((sum, item) => sum + item.qty, 0);
            cartCount.textContent = count;
        } catch (error) {
            console.error("Error loading profile:", error);
            alert("Error loading profile. Please refresh the page.");
        }
    });
});

logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
        await auth.signOut();
        window.location.href = "login.html";
    } catch (error) {
        console.error("Logout error:", error);
        alert("Error logging out. Please try again.");
    }
});

editProfileBtn.addEventListener("click", () => {
    alert("Edit profile feature coming soon!");
});
