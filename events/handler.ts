import { WASocket } from 'baileys';
import { getMessageInfo, getCommand } from '../tools/general';
import { executeCommand } from '../tools/cmd';
import '../config';

export async function messageHandler(sock: WASocket, m: any) {
    const message = m.messages[0];
    if (!message) return;

    try {
        // Mendapatkan informasi pesan
        const { sender, senderID, senderType, isNewsletter } = getMessageInfo(message);
        if (!sender) return;

        // Log pesan masuk
        if (isNewsletter) {
            console.log(`Pesan masuk dari ${senderType}`);
            return; // Tidak memproses command dari newsletter
        } else {
            console.log(`Pesan masuk dari ${senderType} "${senderID}"`);
        }

        // Cek dan eksekusi command menggunakan prefix dari config
        const { cmd, args } = getCommand(global.config.bot.prefix, message);
        if (cmd) {
            await executeCommand(sock, message, cmd, args);
        }
    } catch (error) {
        console.error('Error memproses pesan:', error);
    }
}
