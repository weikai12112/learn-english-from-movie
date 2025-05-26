import axios from "axios";
import CryptoJS from 'crypto-js';
import { translateAppid, translateAccessToken } from "@/constants";

const baseUrl = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
export function getTranslateSign(text: string, salt: string) {
    const stringWithSalt = translateAppid + text + salt + translateAccessToken;
    // 使用crypto-js库计算MD5哈希值
    const md5Hash = CryptoJS.MD5(stringWithSalt);
    return md5Hash.toString();
}

export async function sendTranslateRequest(text: string, from: string, to: string) {
    const url = baseUrl;
    const salt = Array.from({ length: 8 }, () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return characters[Math.floor(Math.random() * characters.length)];
    }).join('');
    const sign = getTranslateSign(text, salt);
    const data = {
        q: text,
        from,
        to,
        "appid": translateAppid,
        "salt": salt,
        "sign": sign
    };
    try {
        const response = await axios.get(`${url}?q=${text}&from=${from}&to=${to}&appid=${translateAppid}&salt=${salt}&sign=${sign}`);
        return response;
    } catch (error) {
        console.error("翻译请求出错:", error);
        throw error;
    }
}