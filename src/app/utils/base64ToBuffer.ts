export const base64ToBuffer = (base64: string) => {
    const data = base64.replace(/^data:image\/\w+;base64,/, "");
    return Buffer.from(data, "base64");
};

