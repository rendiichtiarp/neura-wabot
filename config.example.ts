import { quote } from './tools/formatting';

global.config = {
    bot: {
        name: 'Neura',
        prefix: /^[°•π÷×¶∆£¢€¥®™+✓_=|/~!?@#%^&.©^]/i,
        phoneNumber: '6281284900651',
        groupJid: '120363366663863260@g.us',
        website: 'https://wa.me/6281284900651',
    },
    owner: {
        name: 'Myrex',
        phoneNumber: '6281284900651',
    },
    msg: {
        owner: quote('Maaf, Anda tidak memiliki akses ke perintah ini.'),
        group: quote('Maaf, perintah ini hanya dapat digunakan di grup.'),
        admin: quote('Maaf, perintah ini hanya dapat digunakan oleh admin grup.'),
        botAdmin: quote('Maaf, bot harus menjadi admin grup untuk menggunakan perintah ini.'),
        private: quote('Maaf, perintah ini hanya dapat digunakan di obrolan pribadi.'),
    }
}
