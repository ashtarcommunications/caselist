const now = new Date();
export { now as today };

export const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
export const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
export const currentMonth = now.getMonth();
export const currentYear = now.getFullYear();
export const previousYear = (now.getFullYear() - 1);
export const nextYear = (now.getFullYear() + 1);
export const startOfYear = currentMonth < 6 ? previousYear : currentYear;
export const endOfYear = currentMonth < 6 ? currentYear : nextYear;

export const academicYear = (year) => {
    // If passed a valid year, assume it's the start of the academic year
    if (parseInt(year)) {
        return `${year}-${year + 1}`;
    }

    // Otherwise, assume the current year
    if (currentMonth < 6) {
        return `${previousYear}-${currentYear}`;
    }
    return `${currentYear}-${nextYear}`;
};

export default null;

export const affName = (eventName) => {
    if (eventName === 'pf') { return 'Pro'; }
    return 'Aff';
};
export const negName = (eventName) => {
    if (eventName === 'pf') { return 'Con'; }
    return 'Neg';
};
export const normalizeSide = (side) => {
    switch (side) {
        case 'A': return 'A';
        case 'Aff': return 'A';
        case 'Pro': return 'A';
        case 'N': return 'N';
        case 'Neg': return 'N';
        case 'Con': return 'N';
        default: return side;
    }
};
export const displaySide = (side, event) => {
    if (['A', 'Aff', 'Pro'].indexOf(side) > -1) {
        return event === 'pf' ? 'Pro' : 'Aff';
    }
    if (['N', 'Neg', 'Con'].indexOf(side) > -1) {
        return event === 'pf' ? 'Con' : 'Neg';
    }
    return side;
};

export const roundName = (round) => {
    if (parseInt(round)) { return `Round ${round}`; }
    return round;
};
