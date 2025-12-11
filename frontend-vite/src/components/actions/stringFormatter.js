
/**
 * Function will return formatted string to be used in database searching and URL queries.
 * 
 * @param {string} input string to format for database searching
 * @returns formatted string, (`Home & Garden` -> `home+and+garden`)
 * @author Frank Gonzalez
 * @since 11-24-2025
 */
function normalizeString(input) {
    input = input.toLowerCase();
    input = input.replace(/[^a-z0-9\s&]/g, '');
    input = input.replace(/[^a-z0-9\s]/g, 'and');
    input = input.replace(/[^a-z0-9]/g, '+');
    
    return input;
}
export default normalizeString;

/**
 * Function will return denormalized string for display purposes.
 * @param {string} input string to denormalize from database searching format
 * @returns denormalized string, (`home+and+garden` -> `Home & Garden`)
 * @author Frank Gonzalez
 * @since 11-24-2025
 */
function denormalizeString(input) {
    input = input.replace(/\+/g, ' ');
    input = input.replace(/and/g, '&');
    input = input.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); // Capitalize each word
    return input;
}
export { denormalizeString };