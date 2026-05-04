import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { apiJson } from '../api/client'
import { StorefrontPromoStrip } from './storefront/StorefrontPromoStrip'
import type { CheckoutFields, PublicOrder, PublicSiteSettings } from '../types'

type Props = {
  onBack: () => void
  siteSettings: PublicSiteSettings
}

const initial: CheckoutFields = {
  customerName: '',
  phone: '',
  email: '',
  country: '',
  city: '',
  region: '',
  address: '',
  extraNotes: '',
}

type CreateOrderRes = {
  order: PublicOrder
}

export function CheckoutForm({ onBack, siteSettings }: Props) {
  const navigate = useNavigate()
  const uc = siteSettings.uiCheckout
  const { lines, clearCart } = useCart()
  const [form, setForm] = useState<CheckoutFields>(initial)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = lines.length > 0

  function update<K extends keyof CheckoutFields>(key: K, value: CheckoutFields[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setError(null)
  }

  function validate(): string | null {
    if (!form.customerName.trim()) return 'يرجى إدخال الاسم الكامل.'
    if (!form.phone.trim()) return 'يرجى إدخال رقم الهاتف.'
    /* مؤقت: حقل البريد مخفي وغير إلزامي */
    if (!form.country.trim()) return 'يرجى إدخال الدولة.'
    if (!form.city.trim()) return 'يرجى إدخال المدينة.'
    if (!form.address.trim()) return 'يرجى إدخال العنوان التفصيلي.'
    return null
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const data = await apiJson<CreateOrderRes>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          lines: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
          })),
          customer: {
            ...form,
            email: form.email.trim().toLowerCase() || '',
            country: form.country.trim(),
            city: form.city.trim(),
            region: form.region.trim(),
            address: form.address.trim(),
            extraNotes: form.extraNotes.trim(),
          },
        }),
      })
      clearCart()
      navigate(`/order/${data.order.publicCode}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر إتمام الطلب')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="checkout">
      <button type="button" className="link-btn back-link" onClick={onBack}>
        {uc.backLabel}
      </button>
      <StorefrontPromoStrip slots={siteSettings.promoSlots} placement="checkout_top" />
      <h1 className="checkout-title">{uc.pageTitle}</h1>
      <p className="checkout-lead">{uc.leadText}</p>

      {!canSubmit ? <p className="checkout-warn">{uc.emptyCartWarning}</p> : null}

      <form className="checkout-form" onSubmit={handleConfirm}>
        <label className="field">
          <span>{uc.fieldNameLabel}</span>
          <input
            type="text"
            autoComplete="name"
            value={form.customerName}
            onChange={(e) => update('customerName', e.target.value)}
            disabled={!canSubmit || submitting}
          />
        </label>
        <label className="field">
          <span>{uc.fieldPhoneLabel}</span>
          <input
            type="tel"
            autoComplete="tel"
            placeholder="05xxxxxxxx"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            disabled={!canSubmit || submitting}
          />
        </label>
        <label className="field" style={{ display: 'none' }} aria-hidden="true">
          <span>{uc.fieldEmailLabel}</span>
          <input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            disabled={!canSubmit || submitting}
            tabIndex={-1}
          />
        </label>
        <label className="field">
          <span>{uc.fieldCountryLabel}</span>
          <input
            type="text"
            autoComplete="country-name"
            value={form.country}
            onChange={(e) => update('country', e.target.value)}
            disabled={!canSubmit || submitting}
          />
        </label>
        <label className="field">
          <span>{uc.fieldCityLabel}</span>
          <input
            type="text"
            autoComplete="address-level2"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            disabled={!canSubmit || submitting}
          />
        </label>
        <label className="field">
          <span>{uc.fieldRegionLabel}</span>
          <input
            type="text"
            autoComplete="address-level3"
            value={form.region}
            onChange={(e) => update('region', e.target.value)}
            disabled={!canSubmit || submitting}
          />
        </label>
        <label className="field">
          <span>{uc.fieldAddressLabel}</span>
          <textarea
            rows={3}
            autoComplete="street-address"
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
            disabled={!canSubmit || submitting}
          />
        </label>
        {uc.showExtraNotes ? (
          <label className="field">
            <span>{uc.fieldNotesLabel}</span>
            <textarea
              rows={2}
              value={form.extraNotes}
              onChange={(e) => update('extraNotes', e.target.value)}
              disabled={!canSubmit || submitting}
              placeholder="وقت التوصيل، طلب عينة، إلخ."
            />
          </label>
        ) : null}

        {error ? <p className="form-error">{error}</p> : null}

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={!canSubmit || submitting}
        >
          {submitting ? 'جاري الحفظ…' : uc.submitLabel}
        </button>
      </form>
    </main>
  )
}
