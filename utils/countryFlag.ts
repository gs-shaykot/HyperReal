export function countryFlag(code: string): string {
    return code
        .trim()
        .toUpperCase()
        .replace(/[A-Z]/g, (letter) =>
            String.fromCodePoint(letter.charCodeAt(0) + 127397)
        );
}