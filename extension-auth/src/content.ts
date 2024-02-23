import { AxiosRequestConfig } from "axios";
import browser from "webextension-polyfill";

type SendRequestProps = {
    method: 'get' | 'post' | 'put' | 'delete';
    url: string;
    data?: any;
    axiosConfig?: AxiosRequestConfig;
};

type SendRequestResponse = {
    data: any;
    status: number;
    statusText: string;
};


export class RequestError extends Error {
    constructor(message: string, public data: any) {
        super(message);
    }
}


const sendRequest = async ({ ...props }: SendRequestProps): Promise<SendRequestResponse> => {
    const res = await browser.runtime.sendMessage({ eventName: 'makeRequest', payload: props });
    if (res.success) return res.data;
    const { message, ...error } = res.error;
    throw new RequestError(message, error);
};

sendRequest({ method: 'get', url: '/me' }).then((response) => {
    console.log('DEBUGGER[CONTENT_SCRIPT]', response);
}).catch(error => {
    console.error('DEBUGGER[CONTENT_SCRIPT]:', error);
});