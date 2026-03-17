import { format, getISOWeek, getYear } from 'date-fns';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, increment } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCeAWmSczc8ulw3a9eSuqcTRvJhmX1TpU8",
    authDomain: "agus-counter.firebaseapp.com",
    projectId: "agus-counter",
    storageBucket: "agus-counter.firebasestorage.app",
    messagingSenderId: "1020038058278",
    appId: "1:1020038058278:web:7833a52b6d26af6c2571e7",
    measurementId: "G-3BVEMD92LD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const getKeys = () => {
    const now = new Date();
    return {
        total: 'total_clicks',
        daily: `clicks_${format(now, 'yyyy_MM_dd')}`,
        weekly: `clicks_${getYear(now)}_W${getISOWeek(now)}`,
        monthly: `clicks_${format(now, 'yyyy_MM')}`,
    };
};

export interface CounterStats {
    total: number;
    daily: number;
    weekly: number;
    monthly: number;
}

export const fetchCount = async (key: string): Promise<number> => {
    try {
        const docRef = doc(db, 'counters', key);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().count || 0;
        }
        return 0;
    } catch (error) {
        return 0;
    }
};

export const incrementCount = async (key: string): Promise<number> => {
    try {
        const docRef = doc(db, 'counters', key);
        await setDoc(docRef, { count: increment(1) }, { merge: true });

        // Fetch to get exact new number
        const newSnap = await getDoc(docRef);
        return newSnap.data()?.count || 0;
    } catch (error) {
        return 0;
    }
};

export const getStats = async (): Promise<CounterStats> => {
    const keys = getKeys();
    const [total, daily, weekly, monthly] = await Promise.all([
        fetchCount(keys.total),
        fetchCount(keys.daily),
        fetchCount(keys.weekly),
        fetchCount(keys.monthly),
    ]);

    return { total, daily, weekly, monthly };
};

export const incrementAll = async (): Promise<CounterStats> => {
    const keys = getKeys();

    // Using individual increments (not a transaction strictly required since it's just independent keys)
    const [total, daily, weekly, monthly] = await Promise.all([
        incrementCount(keys.total),
        incrementCount(keys.daily),
        incrementCount(keys.weekly),
        incrementCount(keys.monthly),
    ]);

    return { total, daily, weekly, monthly };
};

export interface MonthlyStat {
    month: string;
    count: number;
}

export const getYearlyStats = async (): Promise<MonthlyStat[]> => {
    const now = new Date();
    const year = getYear(now);
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Parallel fetch is safe on Firebase
    const promises = monthNames.map(async (month, index) => {
        const monthStr = String(index + 1).padStart(2, '0');
        const key = `clicks_${year}_${monthStr}`;
        const count = await fetchCount(key);
        return { month, count };
    });

    return Promise.all(promises);
};
