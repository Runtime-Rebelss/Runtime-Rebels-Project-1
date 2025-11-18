import React from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Props for Filters component
 * @typedef {Object} FiltersProps
 * @property {string[]} categories - List of category names to render
 */

/**
 * Filters component - renders category checkboxes and updates URL params.
 *
 * @param {FiltersProps} props
 * @returns {JSX.Element}
 */

function Filters({ categories = [] }) {
    const [searchParams, setSearchParams] = useSearchParams();
    
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
                                    <span className='label-text'>{category}</span>
                                </label>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Price Dropdown */}
            <div className='dropdown dropdown-end'>
                <div tabIndex={0} role='button' className='btn m-1'>Price</div>
                <ul tabIndex={0} className='dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm'>
                    <h2 className='card-title ml-2'>Sort</h2>
                    <li>
                        <label className='label'>
                            <input type='radio' name='price' value='low' className='radio radio-primary mr-2' />
                            <span className='label-text'>Low to High</span>
                        </label>
                    </li>
                    <li>
                        <label className='label'>
                            <input type='radio' name='price' value='high' className='radio radio-primary mr-2' />
                            <span className='label-text'>High to Low</span>
                        </label>
                    </li>
                    
                    <div className='divider'></div>
                    <h2 className='card-title ml-2'>Filter</h2>
                    <li>

                    </li>
                </ul>
            </div>

            {/* Reset Button */}
            <button 
                className="btn btn-square" 
                onClick={(e) => {
                    e.preventDefault();
                    setSearchParams(params => {
                        params.delete('categories');
                        return params;
                    });
                }}
            >
                ×
            </button>

        </form>
    );
}

export default Filters;