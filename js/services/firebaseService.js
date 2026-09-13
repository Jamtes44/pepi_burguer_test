import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  doc,
  addDoc,
  setDoc,
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAAtcUqZIb03T5J4NJo40tQRrmqaFeifdA",
  authDomain: "pepi-burguer.firebaseapp.com",
  projectId: "pepi-burguer",
  storageBucket: "pepi-burguer.firebasestorage.app",
  messagingSenderId: "635420478260",
  appId: "1:635420478260:web:04912dda724aa329f47361"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Retorna la fecha local actual en formato 'YYYY-MM-DD'
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Registra un pedido entrante en Firestore asociándolo a la fecha del día
 */
export async function addNewOrder(orderData) {
  const todayStr = getTodayDateString();
  const orderWithDate = {
    ...orderData,
    dateStr: todayStr,
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(collection(db, "orders"), orderWithDate);
  return docRef.id;
}

/**
 * Escucha en tiempo real la lista de productos del menú
 */
export function subscribeToProducts(callback) {
  return onSnapshot(collection(db, "products"), (snapshot) => {
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Filtramos para enviar al cliente solo los productos marcados como "isAvailable: true"
    const activeProducts = products.filter(p => p.isAvailable !== false);
    callback(activeProducts);
  });
}

/**
 * Escucha en tiempo real el estado operativo de la tienda (Abierto / Cerrado)
 */
export function subscribeToStoreStatus(callback) {
  const storeRef = doc(db, "settings", "store");
  return onSnapshot(storeRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().isOpen);
    } else {
      // Si el documento no existe aún en Firestore, asume abierto por defecto
      callback(true);
    }
  });
}

/**
 * Guarda el estado operativo de la tienda (Abierto / Cerrado) desde el Admin
 */
export function updateStoreStatus(isOpen) {
  const storeRef = doc(db, "settings", "store");
  return setDoc(storeRef, { isOpen }, { merge: true });
}