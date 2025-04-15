import { 
    default as makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState, 
    Browsers,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    makeCacheableSignalKeyStore
} from 'baileys';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';
import pino from 'pino';
import { messageHandler } from './events/handler';
import { Command } from './tools/general';

// Membuat logger
const logger = pino({
    level: 'fatal'
});

// Map untuk menyimpan command
const commands = new Map<string, Command>();

// Fungsi untuk memuat semua command
async function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const categories = fs.readdirSync(commandsPath);

    for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);
        if (!fs.statSync(categoryPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.ts'));
        for (const file of commandFiles) {
            const filePath = path.join(categoryPath, file);
            const command = require(filePath).command as Command;
            
            commands.set(command.name, command);
            if (command.alias) {
                command.alias.forEach(alias => commands.set(alias, command));
            }

            console.log(`Loaded command: ${command.name} from ${category}/${file}`);
        }
    }

    console.log(`Successfully loaded ${commands.size} commands!`);
    return commands;
}

async function connectToWhatsApp() {
    // Membuat state auth
    const { state, saveCreds } = await useMultiFileAuthState('session');

    // Membuat store untuk menyimpan data
    const store = makeInMemoryStore({
        logger: pino().child({ 
            level: 'silent',
            stream: 'store' 
        })
    });

    // Mendapatkan versi terbaru Baileys
    const { version } = await fetchLatestBaileysVersion();
    
    // Membuat socket WhatsApp dengan konfigurasi lengkap
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino().child({
                level: 'silent',
                stream: 'store'
            }))
        },
        version,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        logger: logger,
        syncFullHistory: true,
        markOnlineOnConnect: true,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 10000,
        generateHighQualityLinkPreview: true,
        patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(
                message.buttonsMessage ||
                message.templateMessage ||
                message.listMessage
            );
            if (requiresPatch) {
                message = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadataVersion: 2,
                                deviceListMetadata: {},
                            },
                            ...message,
                        },
                    },
                };
            }
            return message;
        }
    });

    // Binding store ke event
    store.bind(sock.ev);

    // Menyimpan credentials ketika diperbarui
    sock.ev.on('creds.update', saveCreds);

    // Menangani koneksi
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('Silahkan Scan QR Code dibawah ini:');
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Koneksi terputus karena ', lastDisconnect?.error, ', mencoba koneksi ulang: ', shouldReconnect);
            
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('Terhubung ke WhatsApp! dengan nomor:', state.creds.me?.id.split(':')[0]);
        }
    });

    // Menangani pesan masuk menggunakan handler
    sock.ev.on('messages.upsert', async (m) => {
        await messageHandler(sock, m);
    });

    // Menangani status koneksi
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'connecting') {
            console.log('Menghubungkan...');
        }
    });

    return sock;
}

// Menjalankan fungsi koneksi
connectToWhatsApp();
