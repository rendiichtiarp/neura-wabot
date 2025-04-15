import { Command } from '../../tools/general';
import { quote } from '../../tools/formatting';

export const command: Command = {
    name: 'ping',
    alias: ['p'],
    desc: 'Check bot latency',
    category: 'general',
    permission: {
        private: true
    },
    async execute(sock, message) {
        await sock.sendMessage(message.key.remoteJid!, { text: quote(`🏓 Pong!`) });
    }
}; 