import browser from "webextension-polyfill";

export function getStorageData<T extends string>(key: T): Promise<{ [key in T]?: string }> {
    return new Promise((resolve, reject) =>
        browser.storage.local.get(key).then((result) => {
            if (browser.runtime.lastError) {
                reject(Error(browser.runtime.lastError.message));
            }
            resolve(result as { [key in T]: any });
        })
    );
}

export const setStorageData = (data: { [key: string]: unknown }) =>
    new Promise<void>((resolve, reject) =>
        browser.storage.local.set(data).then(() => {
            if (browser.runtime.lastError) {
                reject(Error(browser.runtime.lastError.message));
            }
            resolve();
        }
        )
    );
