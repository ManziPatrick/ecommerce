"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Mock Redis for development
console.log("⚠️  Using in-memory store (Redis disabled)");
const mockRedis = {
    on: (event, callback) => {
        if (event === 'connect') {
            console.log('✅ Mock Redis connected');
            setTimeout(() => callback(), 100);
        }
        return mockRedis;
    },
    connect: () => {
        console.log('✅ Mock Redis connecting');
        return Promise.resolve();
    },
    quit: () => Promise.resolve('OK'),
    get: () => Promise.resolve(null),
    set: () => Promise.resolve('OK'),
    del: () => Promise.resolve(1)
};
exports.default = mockRedis;
