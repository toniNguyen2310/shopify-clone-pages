// global.d.ts
export { };

declare global {
    // Biến toàn cục dùng để cache kết nối MongoDB khi dev
    var _mongoClientPromise: Promise<any> | undefined;
}
