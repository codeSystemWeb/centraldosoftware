// Inicializacao do Firebase Admin SDK - roda SOMENTE no servidor (API routes).
// Nunca importe este arquivo em componentes "use client".
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON nao configurado no .env.local"
    );
  }
  return JSON.parse(raw);
}

const adminApp = getApps().length
  ? getApps()[0]
  : initializeApp({ credential: cert(getServiceAccount()) });

export const adminDb = getFirestore(adminApp);
