const firebaseConfig = {
    apiKey: "AIzaSyB1uR8m59cVcBMCbCn2MaW_2HV9taPoPJg",
    authDomain: "clothify-40d39.firebaseapp.com",
    databaseURL: "https://clothify-40d39-default-rtdb.firebaseio.com",
    projectId: "clothify-40d39",
    storageBucket: "clothify-40d39.firebasestorage.app",
    messagingSenderId: "101782324264",
    appId: "1:101782324264:web:39e83218c57293981ae11d",
    measurementId: "G-SJVPTJNEBP"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { auth, db, analytics };
}
