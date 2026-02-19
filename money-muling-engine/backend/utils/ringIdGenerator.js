let globalCounter = 0;

export const resetRingIdCounter = () => {
    globalCounter = 0;
};

export const generateRingId = () => {
    globalCounter++;
    return `RING_${String(globalCounter).padStart(3, '0')}`;
};
