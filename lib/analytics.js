import {
    doc,
    setDoc,
    updateDoc,
    increment,
    serverTimestamp,
    collection,
    addDoc
} from "firebase/firestore";

import { db } from "@/lib/firebase";

const VISIT_KEY = "store_visit_date";
const SESSION_KEY = "store_session_started";

function getToday() {
    return new Date().toISOString().slice(0, 10);
}

function browser() {
    const ua = navigator.userAgent;

    if (ua.includes("Edg")) return "Edge";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";

    return "Outro";
}

function os() {
    const ua = navigator.userAgent;

    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iPhone")) return "iPhone";
    if (ua.includes("Mac")) return "MacOS";
    if (ua.includes("Linux")) return "Linux";

    return "Outro";
}

export async function registerVisit() {

    if (sessionStorage.getItem(SESSION_KEY)) {
        return;
    }

    sessionStorage.setItem(SESSION_KEY, "1");

    try {
        const today = getToday();

        const lastVisit = localStorage.getItem(VISIT_KEY);

        const statsRef = doc(db, "stats", "site");

        if (lastVisit !== today) {

            try {
                await updateDoc(statsRef, {
                    totalVisits: increment(1),
                    todayVisits: increment(1),
                    updatedAt: serverTimestamp()
                });
            } catch {

                await setDoc(statsRef, {
                    totalVisits: 1,
                    todayVisits: 1,
                    online: 0,
                    updatedAt: serverTimestamp()
                });

            }

            localStorage.setItem(VISIT_KEY, today);
        }

        const visit = await addDoc(collection(db, "visits"), {
            createdAt: serverTimestamp(),
            page: window.location.pathname,
            browser: browser(),
            os: os(),
            language: navigator.language,
            width: window.innerWidth,
            height: window.innerHeight,
            referrer: document.referrer || "Direto",
            online: true,
            lastSeen: serverTimestamp()
        });

        sessionStorage.setItem("visitId", visit.id);

        await updateDoc(statsRef, {
            online: increment(1)
        });

    } catch (e) {
        console.log(e);
    }
}

export async function heartbeat() {

    const id = sessionStorage.getItem("visitId");

    if (!id) return;

    try {

        await updateDoc(doc(db, "visits", id), {
            lastSeen: serverTimestamp()
        });

    } catch { }
}

export async function leaveSite() {

    const id = sessionStorage.getItem("visitId");

    if (!id) return;

    try {

        await updateDoc(doc(db, "visits", id), {
            online: false,
            leftAt: serverTimestamp()
        });

        await updateDoc(doc(db, "stats", "site"), {
            online: increment(-1)
        });

    } catch { }

}