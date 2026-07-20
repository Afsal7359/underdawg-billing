if (typeof globalThis.navigator === "undefined") globalThis.navigator = {};
if (typeof globalThis.window === "undefined") globalThis.window = { addEventListener() {}, removeEventListener() {} };
