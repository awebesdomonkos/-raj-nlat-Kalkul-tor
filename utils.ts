export const addCalendarDays = (startDate: Date, days: number): Date => {
    const date = new Date(startDate.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('hu-HU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
};

export const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: number;

    return (...args: Parameters<F>): void => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => func(...args), waitFor);
    };
};