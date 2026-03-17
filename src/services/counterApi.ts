import { format, getISOWeek, getYear } from 'date-fns';

const API_BASE_URL = 'https://api.counterapi.dev/v1';
const NAMESPACE = 'oca_contador_agus_teams_v2';

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
        const response = await fetch(`${API_BASE_URL}/${NAMESPACE}/${key}`);
        if (!response.ok) return 0;
        const data = await response.json();
        return data.count || 0;
    } catch (error) {
        return 0;
    }
};

export const incrementCount = async (key: string): Promise<number> => {
    try {
        const response = await fetch(`${API_BASE_URL}/${NAMESPACE}/${key}/up`);
        if (!response.ok) return 0;
        const data = await response.json();
        return data.count || 0;
    } catch (error) {
        return 0;
    }
};

export const getStats = async (): Promise<CounterStats> => {
    const keys = getKeys();
    const total = await fetchCount(keys.total);
    const daily = await fetchCount(keys.daily);
    const weekly = await fetchCount(keys.weekly);
    const monthly = await fetchCount(keys.monthly);

    return { total, daily, weekly, monthly };
};

export const incrementAll = async (): Promise<CounterStats> => {
    const keys = getKeys();
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
    const results: MonthlyStat[] = [];

    for (let i = 0; i < monthNames.length; i++) {
        const month = monthNames[i];
        const monthStr = String(i + 1).padStart(2, '0');
        const key = `clicks_${year}_${monthStr}`;
        const count = await fetchCount(key);
        results.push({ month, count });
    }

    return results;
};
