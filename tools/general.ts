import { WASocket, isJidGroup, isJidNewsletter } from 'baileys';
import '../config';

interface BotConfig {
    bot: {
        name: string;
        prefix: RegExp | string;
        phoneNumber: string;
        groupJid: string;
        website: string;
    };
    owner: {
        name: string;
        phoneNumber: string;
    };
    msg: {
        owner: string;
        group: string;
        admin: string;
        botAdmin: string;
        private: string;
    };
}

declare global {
    var config: BotConfig;
}

export interface Command {
    name: string;
    alias?: string[];
    desc: string;
    use?: string;
    category: string;
    permission?: {
        owner?: boolean;
        group?: boolean;
        adminOnly?: boolean;
        botAdminRequired?: boolean;
        private?: boolean;
    };
    execute: (sock: WASocket, message: any, args: string[]) => Promise<any>;
}

// Fungsi untuk mendapatkan informasi pengirim pesan
export function getMessageInfo(message: any) {
    const sender = message.key.remoteJid;
    const senderID = message.key.participant || message.key.remoteJid;
    const isGroup = isJidGroup(sender);
    const isNewsletter = isJidNewsletter(sender);
    
    let senderType = '';
    if (isNewsletter) {
        senderType = `newsletter: "${sender}"`;
    } else if (isGroup) {
        senderType = `group: "${sender}" oleh:`;
    }
    
    return {
        sender,
        senderID,
        isGroup,
        isNewsletter,
        senderType
    };
}

// Fungsi untuk mengirim status mengetik
export async function sendTyping(sock: WASocket, jid: string, status: 'composing' | 'paused' | 'recording' | 'available' | 'unavailable') {
    try {
        await sock.sendPresenceUpdate(status, jid);
    } catch (error) {
        console.error('Error mengirim status mengetik:', error);
    }
}

// Fungsi untuk mendapatkan command dan arguments dari pesan
export function getCommand(prefix: string | RegExp, message: any) {
    const body = message.message?.conversation || 
                message.message?.extendedTextMessage?.text || 
                message.message?.imageMessage?.caption ||
                message.message?.videoMessage?.caption || '';

    if (typeof prefix === 'string') {
        if (!body.startsWith(prefix)) return { cmd: '', args: [] };
        const args = body.slice(prefix.length).trim().split(/ +/);
        const cmd = args.shift()?.toLowerCase() || '';
        return { cmd, args };
    } else {
        if (!prefix.test(body)) return { cmd: '', args: [] };
        const args = body.replace(prefix, '').trim().split(/ +/);
        const cmd = args.shift()?.toLowerCase() || '';
        return { cmd, args };
    }
}

// Fungsi untuk mendapatkan prefix yang digunakan user dalam pesan
export function getUserPrefix(message: any): string {
    return message.message?.conversation?.charAt(0) || 
           message.message?.extendedTextMessage?.text?.charAt(0) || 
           message.message?.imageMessage?.caption?.charAt(0) ||
           message.message?.videoMessage?.caption?.charAt(0) || '';
}

// Fungsi untuk mendapatkan command yang digunakan beserta prefixnya
export function getUsedCommand(message: any): { prefix: string; command: string; args: string[] } {
    const prefix = getUserPrefix(message);
    const body = message.message?.conversation || 
                message.message?.extendedTextMessage?.text || 
                message.message?.imageMessage?.caption ||
                message.message?.videoMessage?.caption || '';
                
    const args = body.slice(1).trim().split(/ +/);
    const command = args.shift()?.toLowerCase() || '';

    return {
        prefix,
        command,
        args
    };
}
