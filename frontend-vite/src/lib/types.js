/**
 * Product object used across the frontend.
 * @typedef {Object} Product
 * @property {string} _id
 * @property {string} name
 * @property {string} [description]
 * @property {number} price
 * @property {string} [imageUrl]
 * @property {string} [category]
 * @property {string[]} [categories]
 * @property {string} [slug]
 * @property {string} [sku]
 */


/**
 * @callback ProductsSetter
 * @param {Product[]} products
 */

/**
 * @callback LoadingSetter
 * @param {boolean} isLoading
 */

export default {};
