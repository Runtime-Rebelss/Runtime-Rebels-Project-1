import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { denormalizeString } from './actions/stringFormatter';

/**
 * Props for Filters component
 * @typedef {Object} FiltersProps
 * @property {string[]} categories - List of category names to render
 * @property {boolean} preserveCategory - Whether to preserve the original category on reset
 */

/**
 * Filters component - renders category checkboxes and updates URL params.
 *
 * @author Frank Gonzalez
 * @since 11-19-2025
 * @param {FiltersProps} props
 * @returns {JSX.Element}
 */

function Filters({ categories = [], preserveCategory = false }) {
    const [searchParams, setSearchParams] = useSearchParams();

    const [originalCategory] = React.useState(() => 
        preserveCategory ? searchParams.getAll('categories')[0] : null
    );

    const handleCategoryChange = (category, checked) => {
        const currentCategories = new Set(searchParams.getAll('categories'));

        if (checked) {
            currentCategories.add(category);
        } else {
            currentCategories.delete(category);
        }

        // Update URL parameters with new categories
        setSearchParams(params => {
            // Remove all existing category parameters
            params.delete('categories');
            // Add each selected category
            currentCategories.forEach(cat => params.append('categories', cat.toLowerCase()));
            return params;
        });
    };

    const handleSortChange = (sortValue) => {
        setSearchParams(params => {
            params.set('sort', sortValue);
            return params;
        });
    };

    const handleReset = (e) => {
        e.preventDefault();
        setSearchParams(params => {
            params.delete('categories');
            params.delete('sort');
            // Restore the original category if one was set when navigating to this page
            if (preserveCategory && originalCategory) {
                params.append('categories', originalCategory);
            }
            return params;
        });
    };

    return (
        <form>
            {/* Category Dropdown */}
            <div className='dropdown dropdown-end'>
                <div tabIndex={0} role='button' className='btn m-1'>Categories</div>
                {/* tabIndex={0} makes the content focusable which daisyUI uses to toggle visibility */}
                <ul tabIndex={0} className='dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm'>
                    {categories.length === 0 ? (
                        <li className='px-2 py-1 text-sm text-muted'>No categories</li>
                    ) : (
                        categories.map((category) => (
                            <li key={category}>
                                <label className='label'>
                                    <input
                                        type='checkbox'
                                        name={category}
                                        id={category}
                                        checked={searchParams.getAll('categories').includes(category.toLowerCase())}
                                        onChange={(e) => handleCategoryChange(category, e.target.checked)}
                                        className='checkbox checkbox-primary mr-2'
                                    />
                                    <span className='label-text'>{denormalizeString(category)}</span>
                                </label>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Price Dropdown */}
            <div className='dropdown dropdown-end'>
                <div tabIndex={0} role='button' className='btn m-1'>Sort</div>
                <ul tabIndex={0} className='dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm'>
                    <h2 className='card-title ml-2'>Price</h2>
                    <li>
                        <label className='label'>
                            <input type='radio' name='price' value='low' checked={searchParams.get('sort') === 'low'} onChange={(e) => handleSortChange(e.target.value)} className='radio radio-primary mr-2' />
                            <span className='label-text'>Low to High</span>
                        </label>
                    </li>
                    <li>
                        <label className='label'>
                            <input type='radio' name='price' value='high' checked={searchParams.get('sort') === 'high'} onChange={(e) => handleSortChange(e.target.value)} className='radio radio-primary mr-2' />
                            <span className='label-text'>High to Low</span>
                        </label>
                    </li>
                </ul>
            </div>

            {/* Reset Button */}
            <button 
                className="btn btn-square" 
                onClick={handleReset}
            >
                ×
            </button>        </form>
    );
}

export default Filters;