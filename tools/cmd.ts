import { WASocket } from 'baileys';
import { Command, getUsedCommand } from './general';
import * as fs from 'fs';
import * as path from 'path';
import '../config';
import { checkPermission } from '../middleware';
import { findBestMatch } from 'string-similarity';
import { monospace, quote } from './formatting';

// Map untuk menyimpan command
export const commands = new Map<string, Command>();
// Map untuk menyimpan alias ke command name
export const aliases = new Map<string, string>();

/**
 * Fungsi untuk mencari command yang mirip
 */
function findSimilarCommand(cmd: string): string | null {
    const allCommands = [...commands.keys(), ...aliases.keys()];
    if (allCommands.length === 0) return null;

    const { bestMatch } = findBestMatch(cmd, allCommands);
    return bestMatch.rating > 0.5 ? bestMatch.target : null;
}

/**
 * Fungsi untuk memuat semua command
 */
export function loadCommands() {
    const commandsPath = path.join(__dirname, '../commands');
    const categories = fs.readdirSync(commandsPath);
    let totalCommands = 0;

    for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);
        if (!fs.statSync(categoryPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.ts'));
        for (const file of commandFiles) {
            const filePath = path.join(categoryPath, file);
            const command = require(filePath).command as Command;
            
            commands.set(command.name, command);
            totalCommands++;

            // Simpan alias dalam map terpisah
            if (command.alias) {
                command.alias.forEach(alias => aliases.set(alias, command.name));
            }
        }
    }

    console.log(`Berhasil memuat ${totalCommands} command!`);
    console.log(`Total alias yang terdaftar: ${aliases.size}`);
}

/**
 * Fungsi untuk menangani eksekusi command
 */
export async function executeCommand(sock: WASocket, message: any, cmd: string, args: string[]) {
    try {
        // Cek apakah cmd adalah alias, jika ya gunakan command aslinya
        const commandName = aliases.get(cmd) || cmd;
        const command = commands.get(commandName);
        const { prefix, command: usedCmd } = getUsedCommand(message);
        
        if (command) {
            // Cek permission sebelum eksekusi command
            const permissionCheck = await checkPermission(sock, message, command);
            if (!permissionCheck.isAllowed) {
                if (permissionCheck.message) {
                    await sock.sendMessage(message.key.remoteJid, { text: permissionCheck.message });
                }
                return;
            }

            // Eksekusi command jika permission diterima
            await command.execute(sock, message, args);
        } else {
            // Cari command yang mirip
            const similarCommand = findSimilarCommand(usedCmd);
            const response = similarCommand 
                ? quote(`Perintah ${monospace(prefix + usedCmd)} tidak ditemukan.\nMungkin maksud Anda: ${monospace(prefix + similarCommand)}?`)
                : quote(`Perintah ${monospace(prefix + usedCmd)} tidak ditemukan.`);
            
            await sock.sendMessage(message.key.remoteJid, { text: response });
        }
    } catch (error) {
        console.error(`Error executing command ${cmd}:`, error);
        await sock.sendMessage(message.key.remoteJid, { text: 'Terjadi kesalahan saat menjalankan command!' });
    }
}

// Memuat command saat file diimpor
loadCommands();
