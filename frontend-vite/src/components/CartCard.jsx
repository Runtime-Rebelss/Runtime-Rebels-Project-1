import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { updateQuantity, removeItem } from '../lib/cart';

const CartCard = ({ item }) => {
    const id = item.productId || item.id;

    return (
        <tr>
            <td>
                <div className="flex items-center gap-3">
                    <div className="mask mask-squircle w-14 h-14">
                        <img
                            src={
                                item.image || ""
                            }
                            alt={item.name}
                        />
                    </div>
                    <div>
                        <div className="font-medium">{item.name}</div>
                    </div>
                </div>
            </td>
            <td>
                <div className="join">
                    <button
                        className="btn join-item"
                        onClick={() => updateQuantity(id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                    >
                        <Minus className="w-4 h-4"/>
                    </button>
                    <input
                        className="input input-bordered w-16 text-center join-item"
                        readOnly
                        value={item.quantity}
                    />
                    <button
                        className="btn join-item"
                        onClick={() => updateQuantity(id, item.quantity + 1)}
                    >
                        <Plus className="w-4 h-4"/>
                    </button>
                </div>
            </td>
            <td className="text-right">${Number(item.price || 0).toLocaleString()}</td>
            {/* right-aligned action cell */}
            <td className="w-24">
                <div className="flex items-center justify-end">
                    <button
                        className="btn btn-ghost text-error"
                        onClick={() => removeItem(id)}
                        title="Remove item"
                    >
                        <Trash2 className="w-5 h-5"/>
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default CartCard;