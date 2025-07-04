/* Letters */
export const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
export const LETTERS = UPPERCASE + LOWERCASE;

/* Digits */
export const DIGITS = "0123456789";

/* Alphanumeric */
export const ALPHANUMERIC = LETTERS + DIGITS;

/* Symbols */
export const BASIC_SYMBOLS = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";

/* Whitespace */
export const SPACE = " ";
export const TAB = "\t";
export const NEWLINE = "\n";
export const CARRIAGE_RETURN = "\r";
export const NON_BREAKING_SPACE = "\u00A0";
export const WHITESPACE = SPACE + TAB + NON_BREAKING_SPACE;
export const NEWLINES = NEWLINE + CARRIAGE_RETURN;

/* Simple Unicode Samples */
export const EMOJIS = "😀😃😄😁😆😅😂🤣😊😇";
export const CURRENCY_SYMBOLS = "€£¥¢₹$";
export const MATH_SYMBOLS = "±÷×√∑∏∞≈≠≤≥";
export const UNICODE_SYMBOLS = EMOJIS + CURRENCY_SYMBOLS + MATH_SYMBOLS;
