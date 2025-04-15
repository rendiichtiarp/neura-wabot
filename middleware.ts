import { WASocket, isJidGroup } from 'baileys';
import { Command } from './tools/general';
import './config';

interface PermissionCheck {
    isAllowed: boolean;
    message?: string;
}

export async function checkPermission(sock: WASocket, message: any, command: Command): Promise<PermissionCheck> {
    try {
        const sender = message.key.remoteJid;
        const senderID = message.key.participant || message.key.remoteJid;
        const isGroup = isJidGroup(sender);
        
        // Jika tidak ada permission yang diset, izinkan semua
        if (!command.permission) {
            return { isAllowed: true };
        }

        const permissionChecks = [
            {
                key: 'owner',
                condition: command.permission.owner && senderID.split('@')[0] !== global.config.owner.phoneNumber.replace(/[^0-9]/g, ''),
                message: global.config.msg.owner
            },
            {
                key: 'group',
                condition: command.permission.group && !isGroup,
                message: global.config.msg.group
            },
            {
                key: 'adminOnly',
                condition: command.permission.adminOnly && isGroup,
                check: async () => {
                    const groupMetadata = await sock.groupMetadata(sender);
                    return !groupMetadata.participants.some(p => 
                        p.id === senderID && (p.admin === 'admin' || p.admin === 'superadmin')
                    );
                },
                message: global.config.msg.admin
            },
            {
                key: 'botAdminRequired',
                condition: command.permission.botAdminRequired && isGroup,
                check: async () => {
                    const groupMetadata = await sock.groupMetadata(sender);
                    const botID = sock.user?.id;
                    return !groupMetadata.participants.some(p => 
                        p.id === botID && (p.admin === 'admin' || p.admin === 'superadmin')
                    );
                },
                message: global.config.msg.botAdmin
            },
            {
                key: 'private',
                condition: command.permission.private && isGroup,
                message: global.config.msg.private
            }
        ];

        for (const check of permissionChecks) {
            if (check.condition) {
                const failed = check.check ? await check.check() : true;
                if (failed) {
                    return {
                        isAllowed: false,
                        message: check.message
                    };
                }
            }
        }

        return { isAllowed: true };
    } catch (error: any) {
        console.error('Error umum pada checkPermission:', error);
        return {
            isAllowed: false,
            message: 'Terjadi kesalahan internal saat memeriksa permission'
        };
    }
}
