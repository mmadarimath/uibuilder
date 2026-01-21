import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'
import { autoTextColor } from '../utils/color'

const defaultCountries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'Australia']

const LandingPageRenderer = ({ state }) => {
    const { layout, navbar, hero, heroButton, content, form, footer } = state
    const containerStyle = layout.fluid
        ? { width: '100%', paddingLeft: '24px', paddingRight: '24px' }
        : { maxWidth: '1200px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px' }

    const textOnNavbar = autoTextColor(navbar.bgColor)
    const heroTextColor = hero.titleColor || (hero.type === 'color' ? autoTextColor(hero.bgColor) : '#ffffff')
    const heroButtonTextColor = heroButton.textColor || autoTextColor(heroButton.bgColor)
    const formButtonTextColor = form.button.textColor || autoTextColor(form.button.bgColor)
    const stackInputs = form.stackInputs !== false
    const panelBgType = form.panelBgType || 'color'
    const panelBgColor = form.panelBgColor || '#ffffff'
    const hasPanelImage = panelBgType === 'image' && Boolean(form.panelBgImage)
    const panelTextColor = form.panelTextColor || (hasPanelImage ? '#ffffff' : autoTextColor(panelBgColor))
    const panelStyle = {
        background: hasPanelImage ? undefined : panelBgColor,
        backgroundImage: hasPanelImage ? `url(${form.panelBgImage})` : undefined,
        backgroundSize: hasPanelImage ? 'cover' : undefined,
        backgroundPosition: hasPanelImage ? 'center' : undefined,
        color: panelTextColor,
        padding: form.panelPadding ?? 24,
        marginTop: form.panelMargin ?? 0,
        marginBottom: form.panelMargin ?? 0,
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    }

    const [countrySelection, setCountrySelection] = useState({})

    const parseLines = (text = '') => text.split(/\n/).map((l) => l.trim()).filter(Boolean)
    const customFields = (form.customQuestions || []).map((q) => {
        const options = parseLines(q.optionsText || '').length ? parseLines(q.optionsText || '') : q.type === 'country' ? defaultCountries : []
        return {
            id: `custom-${q.id}`,
            type: q.type === 'country' ? 'country' : q.type === 'checkboxGroup' ? 'checkboxGroup' : 'select',
            label: q.label || 'Custom question',
            options,
            showLabel: true,
            name: q.label ? q.label.toLowerCase().replace(/\s+/g, '') : `custom-${q.id}`,
        }
    })

    const baseFields = [...form.fields, ...customFields]

    const primaryCountryField = baseFields.find((f) => f.type === 'country')
    const stateFields = baseFields.filter((f) => f.type === 'state')
    const shouldAutoState = primaryCountryField && stateFields.length === 0
    const autoStateField = shouldAutoState
        ? {
            id: 'auto-state',
            type: 'state',
            label: 'State / Province',
            showLabel: true,
            dependsOn: primaryCountryField.id,
            stateMap: {
                'United States': ['California', 'New York', 'Texas', 'Florida'],
                Canada: ['Ontario', 'Quebec', 'British Columbia'],
                'United Kingdom': ['England', 'Scotland', 'Wales'],
            },
        }
        : null
    const formFields = autoStateField ? [...baseFields, autoStateField] : baseFields
    const inputFields = formFields.filter((f) => f.type !== 'checkbox' && f.type !== 'optIn' && f.type !== 'checkboxGroup')
    const bottomFields = formFields.filter((f) => f.type === 'checkbox' || f.type === 'optIn' || f.type === 'checkboxGroup')

    const buttonWidthStyle = (width) => {
        if (width === 'lg') return { minWidth: '220px' }
        if (width === 'sm') return { minWidth: '140px' }
        return { minWidth: '180px' }
    }

    const fieldName = (field) => field.name || field.id
    const linkifyLegalText = (text = '') => {
        const tokens = {
            __PRIVACY_POLICY__: '<a href="#privacy" style="color:inherit;text-decoration:underline;">Privacy Policy</a>',
            __TERMS_OF_SERVICE__: '<a href="#terms" style="color:inherit;text-decoration:underline;">Terms of Service</a>',
            __TERMS_AND_CONDITIONS__: '<a href="#terms" style="color:inherit;text-decoration:underline;">Terms and Conditions</a>',
            __TERMS__: '<a href="#terms" style="color:inherit;text-decoration:underline;">Terms</a>',
        }
        return (text || '')
            .replace(/terms and conditions/gi, '__TERMS_AND_CONDITIONS__')
            .replace(/terms of service/gi, '__TERMS_OF_SERVICE__')
            .replace(/privacy policy/gi, '__PRIVACY_POLICY__')
            .replace(/\bterms\b/gi, '__TERMS__')
            .replace(/__TERMS_AND_CONDITIONS__|__TERMS_OF_SERVICE__|__PRIVACY_POLICY__|__TERMS__/g, (match) => tokens[match] || match)
    }

    const thumb = content.thumbnail ? (
        <img src={content.thumbnail} alt="Thumbnail" style={{ maxWidth: '100%', borderRadius: '12px', marginBottom: '16px' }} />
    ) : null

    const thumbBlock = content.thumbPosition === 'above'
        ? (
            <>
                {thumb}
                <div dangerouslySetInnerHTML={{ __html: content.abstract }} style={{ lineHeight: 1.7 }} />
            </>
        )
        : (
            <>
                <div dangerouslySetInnerHTML={{ __html: content.abstract }} style={{ lineHeight: 1.7 }} />
                {thumb}
            </>
        )

    const alignText = (align) => align === 'center' ? 'center' : align === 'end' ? 'right' : 'left'
    const alignFlex = (align) => align === 'center' ? 'center' : align === 'end' ? 'flex-end' : 'flex-start'

    const currentYear = new Date().getFullYear()
    const brandName = footer.brandName || 'Brand'
    const brandUrl = footer.brandUrl || '#'
    const showCopyright = footer.showCopyright !== false
    const serviceProvider = footer.serviceProvider || ''
    const serviceProviderUrl = footer.serviceProviderUrl || '#'
    const navJustify = navbar.align === 'center' ? 'center' : navbar.align === 'end' ? 'flex-end' : 'flex-start'
    const hasSecondary = Boolean(navbar.secondaryLogo)

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '14px',
        background: '#ffffff',
        color: '#1a1a1a',
        outline: 'none',
        boxSizing: 'border-box',
    }

    const checkboxStyle = {
        width: '18px',
        height: '18px',
        marginRight: '10px',
        accentColor: form.button.bgColor,
    }

    return (
        <div className="preview-frame" style={{ background: '#ffffff', color: '#1a1a1a', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            {/* Navbar */}
            <header style={{ background: navbar.bgColor, color: textOnNavbar }}>
                <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: hasSecondary ? 'space-between' : navJustify, gap: '16px', padding: '16px 24px' }}>
                    <div>
                        {navbar.link ? (
                            <a href={navbar.link} style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
                                {navbar.logo ? <img src={navbar.logo} alt="Logo" style={{ height: 40 }} /> : <span style={{ fontWeight: 600 }}>Brand</span>}
                            </a>
                        ) : (
                            navbar.logo ? <img src={navbar.logo} alt="Logo" style={{ height: 40 }} /> : <span style={{ fontWeight: 600 }}>Brand</span>
                        )}
                    </div>
                    {navbar.secondaryLogo && <div><img src={navbar.secondaryLogo} alt="Secondary logo" style={{ height: 36 }} /></div>}
                </div>
            </header>

            {/* Hero Section */}
            <section
                style={
                    hero.type === 'color'
                        ? { background: hero.bgColor, color: heroTextColor, paddingTop: hero.paddingY, paddingBottom: hero.paddingY, textAlign: alignText(hero.align) }
                        : {
                            backgroundImage: `url(${hero.bgImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            color: heroTextColor,
                            paddingTop: hero.paddingY,
                            paddingBottom: hero.paddingY,
                            textAlign: alignText(hero.align),
                        }
                }
            >
                <div style={containerStyle}>
                    <h1 style={{ fontSize: '48px', fontWeight: 700, marginBottom: '16px', lineHeight: 1.2 }}>{hero.title}</h1>
                    {hero.showSubtitle && hero.subtitle && (
                        <p style={{ fontSize: '20px', color: heroTextColor, opacity: 0.9, marginBottom: '24px', maxWidth: '600px', margin: hero.align === 'center' ? '0 auto 24px' : '0 0 24px' }}>{hero.subtitle}</p>
                    )}
                    {hero.showButton && (
                        <div style={{ display: 'flex', justifyContent: alignFlex(heroButton.align) }}>
                            <button style={{
                                background: heroButton.bgColor,
                                color: heroButtonTextColor,
                                padding: '14px 32px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                ...buttonWidthStyle(heroButton.width)
                            }}>
                                {heroButton.text}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Main Content */}
            <main style={{ ...containerStyle, paddingTop: content.paddingY, paddingBottom: content.paddingY }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'start' }}>
                    {/* Content Column */}
                    <div style={{ textAlign: alignText(content.align) }}>{thumbBlock}</div>

                    {/* Form Column */}
                    <div>
                        <div style={panelStyle}>
                            <h4 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', textAlign: alignText(form.titleAlign), color: panelTextColor }}>{form.title}</h4>
                            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: stackInputs ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr', gap: '12px' }}>
                                    {inputFields.map((field) => {
                                        const showLabel = field.showLabel !== false

                                        if (field.type === 'select' || field.type === 'country') {
                                            return (
                                                <div key={field.id}>
                                                    {showLabel && <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: panelTextColor }}>{field.label}</label>}
                                                    <select
                                                        style={inputStyle}
                                                        name={fieldName(field)}
                                                        onChange={(e) => setCountrySelection((prev) => ({ ...prev, [field.id]: e.target.value }))}
                                                        value={countrySelection[field.id] || ''}
                                                    >
                                                        <option value="">Select...</option>
                                                        {((field.options && field.options.length) ? field.options : field.type === 'country' ? defaultCountries : []).map((opt) => (
                                                            <option key={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )
                                        }

                                        if (field.type === 'state') {
                                            const depends = field.dependsOn
                                            const selectedCountry = depends ? countrySelection[depends] : undefined
                                            const states = selectedCountry ? (field.stateMap?.[selectedCountry] || []) : []
                                            const disabled = !selectedCountry
                                            return (
                                                <div key={field.id}>
                                                    {showLabel && <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: panelTextColor }}>{field.label}</label>}
                                                    <select style={{ ...inputStyle, opacity: disabled ? 0.6 : 1 }} name={fieldName(field)} disabled={disabled}>
                                                        <option value="">{disabled ? 'Select country first' : 'Select state/province'}</option>
                                                        {states.map((st) => <option key={st}>{st}</option>)}
                                                    </select>
                                                </div>
                                            )
                                        }

                                        if (field.type === 'checkboxGroup') {
                                            const items = (field.options || []).length ? field.options : ['Option 1', 'Option 2']
                                            return (
                                                <div key={field.id}>
                                                    {showLabel && <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: panelTextColor }}>{field.label}</label>}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        {items.map((opt) => (
                                                            <label key={`${field.id}-${opt}`} style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                                                                <input type="checkbox" name={`${fieldName(field)}[]`} style={checkboxStyle} />
                                                                {opt}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        }

                                        return (
                                            <div key={field.id}>
                                                {showLabel && <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: panelTextColor }}>{field.label}</label>}
                                                <input style={inputStyle} type={field.type} name={fieldName(field)} placeholder={field.placeholder} />
                                            </div>
                                        )
                                    })}
                                </div>

                                {bottomFields.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {bottomFields.map((field) => {
                                            const showLabel = field.showLabel !== false
                                            if (field.type === 'checkboxGroup') {
                                                const items = (field.options || []).length ? field.options : ['Option 1', 'Option 2']
                                                return (
                                                    <div key={field.id}>
                                                        {showLabel && <div style={{ fontWeight: 500, marginBottom: '8px', fontSize: '14px' }}>{field.label}</div>}
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            {items.map((opt) => (
                                                                <label key={`${field.id}-${opt}`} style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                                                                    <input type="checkbox" name={`${fieldName(field)}[]`} style={checkboxStyle} />
                                                                    {opt}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            }

                                            if (field.type === 'optIn') {
                                                return (
                                                    <label key={field.id} style={{ display: 'flex', alignItems: 'flex-start', fontSize: '13px', cursor: 'pointer', lineHeight: 1.5 }}>
                                                        <input type="checkbox" name={fieldName(field)} style={{ ...checkboxStyle, marginTop: '2px' }} />
                                                        {showLabel && <span dangerouslySetInnerHTML={{ __html: linkifyLegalText(field.label) }} />}
                                                    </label>
                                                )
                                            }

                                            return (
                                                <label key={field.id} style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                                                    <input type="checkbox" name={fieldName(field)} style={checkboxStyle} />
                                                    {showLabel && field.label}
                                                </label>
                                            )
                                        })}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: alignFlex(form.button.align) }}>
                                    <button
                                        type="submit"
                                        name={form.button.name || 'submit'}
                                        value={form.button.value || 'Download Now'}
                                        style={{
                                            background: form.button.bgColor,
                                            color: formButtonTextColor,
                                            padding: '14px 28px',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            ...buttonWidthStyle(form.button.width)
                                        }}>
                                        {form.button.text}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{
                background: footer.bgColor,
                color: footer.textColor || autoTextColor(footer.bgColor),
                paddingTop: footer.paddingY,
                paddingBottom: footer.paddingY,
                textAlign: alignText(footer.align),
            }}>
                <div style={{ ...containerStyle, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span>
                        {showCopyright && `© ${currentYear} `}
                        <a href={brandUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>{brandName}</a>
                        . All rights reserved.
                    </span>
                    {serviceProvider && (
                        <span>
                            Services rendered by: <a href={serviceProviderUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>{serviceProvider}</a>
                        </span>
                    )}
                </div>
            </footer>
        </div>
    )
}

LandingPageRenderer.propTypes = {
    state: PropTypes.object.isRequired,
}

export default LandingPageRenderer
