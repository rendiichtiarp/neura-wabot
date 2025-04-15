/**
 * Fungsi untuk memformat teks menjadi bold
 * @param text Teks yang akan diformat
 * @returns Teks yang sudah diformat bold
 * @example bold("Halo") => **Halo**
 */
export function bold(text: string): string {
    return `*${text}*`;
}

/**
 * Fungsi untuk memformat teks menjadi italic
 * @param text Teks yang akan diformat
 * @returns Teks yang sudah diformat italic
 * @example italic("Halo") => _Halo_
 */
export function italic(text: string): string {
    return `_${text}_`;
}

/**
 * Fungsi untuk memformat teks menjadi strikethrough
 * @param text Teks yang akan diformat
 * @returns Teks yang sudah diformat strikethrough
 * @example strikethrough("Halo") => ~Halo~
 */
export function strikethrough(text: string): string {
    return `~${text}~`;
}

/**
 * Fungsi untuk memformat teks menjadi monospace
 * @param text Teks yang akan diformat
 * @returns Teks yang sudah diformat monospace
 * @example monospace("Halo") => ```Halo```
 */
export function monospace(text: string): string {
    return `\`\`\`${text}\`\`\``;
}

/**
 * Fungsi untuk memformat teks menjadi inline code
 * @param text Teks yang akan diformat
 * @returns Teks yang sudah diformat inline code
 * @example inlineCode("Halo") => `Halo`
 */
export function inlineCode(text: string): string {
    return `\`${text}\``;
}

/**
 * Fungsi untuk memformat teks menjadi quote
 * @param text Teks yang akan diformat
 * @returns Teks yang sudah diformat quote
 * @example quote("Halo") => > Halo
 */
export function quote(text: string): string {
    return text.split('\n').map(line => `> ${line}`).join('\n');
}

/**
 * Fungsi untuk memformat teks menjadi list
 * @param items Array teks yang akan diformat
 * @param ordered Boolean untuk menentukan apakah list berurutan atau tidak
 * @returns Teks yang sudah diformat list
 * @example list(["Satu", "Dua"]) => • Satu\n• Dua
 * @example list(["Satu", "Dua"], true) => 1. Satu\n2. Dua
 */
export function list(items: string[], ordered: boolean = false): string {
    return items.map((item, index) => 
        ordered ? `${index + 1}. ${item}` : `• ${item}`
    ).join('\n');
}

/**
 * Fungsi untuk menggabungkan beberapa format
 * @param text Teks yang akan diformat
 * @param formats Array fungsi format yang akan digunakan
 * @returns Teks yang sudah diformat
 * @example combine("Halo", [bold, italic]) => *_Halo_*
 */
export function combine(text: string, formats: ((text: string) => string)[]): string {
    return formats.reduce((result, format) => format(result), text);
}

/**
 * Fungsi untuk membuat teks menjadi readmore
 * @returns Karakter readmore WhatsApp
 */
export function readmore(): string {
    return '‎\u200e'.repeat(4000);
}

/**
 * Fungsi untuk membuat teks dengan garis bawah
 * @param text Teks yang akan diformat
 * @returns Teks yang sudah diformat underline
 * @example underline("Halo") => _Halo_
 */
export function underline(text: string): string {
    return `_${text}_`;
}

/**
 * Fungsi untuk membuat teks dengan format mention
 * @param number Nomor yang akan di-mention (format: 628xxx)
 * @returns Teks yang sudah diformat mention
 * @example mention("628123456789") => @628123456789
 */
export function mention(number: string): string {
    return `@${number.replace(/[^0-9]/g, '')}`;
}

/**
 * Fungsi untuk membuat teks dengan format spoiler
 * @param text Teks yang akan diformat
 * @returns Teks yang sudah diformat spoiler
 * @example spoiler("Halo") => ||Halo||
 */
export function spoiler(text: string): string {
    return `||${text}||`;
}
