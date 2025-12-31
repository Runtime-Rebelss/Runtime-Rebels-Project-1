import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';

const CartCard = ({ item, onUpdateQuantity, onRemove }) => {
    const id = item.productId || item.id;

    return (
        <tr className="align-top">
            <td>
                <div className="flex items-center gap-3">
                    <div className="mask mask-squircle w-12 h-12">
                        <img
                            src={item.image || ""}
                            alt={item.name}
                            className="object-contain w-full h-full"
                        />
                    </div>
                    <div>
                        <div className="font-medium text-sm leading-tight">{item.name}</div>
                        <div className="text-sm text-base-content/60">{item.description || ''}</div>
                    </div>
                </div>
            </td>
            <td>
                <div className="join">
                    <button
                        type="button"
                        className="btn btn-med join-item"
                        onClick={() => onUpdateQuantity && onUpdateQuantity(id, (Number(item.quantity) || 1) - 1)}
                        disabled={(Number(item.quantity) || 1) <= 1}
                    >
                        <Minus className="w-4 h-4"/>
                    </button>
                    <input
                        className="input input-bordered w-12 text-center join-item"
                        readOnly
                        value={item.quantity}
                    />
                    <button
                        type="button"
                        className="btn btn-med join-item"
                        onClick={() => onUpdateQuantity && onUpdateQuantity(id, (Number(item.quantity) || 1) + 1)}
                    >
                        <Plus className="w-4 h-4"/>
                    </button>
                </div>
            </td>
            <td className="text-right font-semibold text-med">${Number(item.price || 0).toLocaleString()}</td>
            {/* right-aligned action cell */}
            <td className="w-28">
                <div className="flex items-center justify-end">
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => onRemove && onRemove(id)}
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