import { useCart } from '../context/CartContext'

export function CartUndoToast() {
  const { undoAvailable, undoLastAdd } = useCart()

  if (!undoAvailable) return null

  return (
    <div className="cart-undo-toast" role="status">
      <span className="cart-undo-toast-text">تمت الإضافة للسلة</span>
      <button type="button" className="btn btn-ghost cart-undo-toast-btn" onClick={undoLastAdd}>
        تراجع
      </button>
    </div>
  )
}
