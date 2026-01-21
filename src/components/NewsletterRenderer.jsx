import PropTypes from 'prop-types'
import { autoTextColor } from '../utils/color'

const NewsletterRenderer = ({ state }) => {
    const { navbar, hero, heroButton, thumbnail, abstract, button, divider, footer, abstractAlign = 'start', abstractPaddingY = 24 } = state
    const navbarText = autoTextColor(navbar.bgColor)
    const heroText = hero.titleColor || (hero.type === 'color' ? autoTextColor(hero.bgColor) : '#ffffff')
    const buttonText = button.textColor || autoTextColor(button.bgColor)
    const heroButtonText = heroButton?.textColor || autoTextColor(heroButton?.bgColor || '#ffffff')
    const thumbWidth = thumbnail.mode === 'small' ? '380px' : '680px'
    const navJustify = navbar.align === 'center' ? 'center' : navbar.align === 'end' ? 'right' : 'left'
    const navFlex = navbar.align === 'center' ? 'center' : navbar.align === 'end' ? 'flex-end' : 'flex-start'
    const hasSecondary = Boolean(navbar.secondaryLogo)
    const hasHeroImage = hero.showImage && hero.heroImage

    const getButtonWidthStyle = (btn) => {
        if (btn?.width === 'lg') return { minWidth: '220px' }
        if (btn?.width === 'sm') return { minWidth: '140px' }
        return { minWidth: '180px' }
    }

    const renderHeroContent = () => (
        <>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>{hero.title}</h2>
            {hero.showSubtitle && hero.subtitle && (
                <p style={{ margin: '12px 0 0 0', fontSize: '16px', opacity: 0.9 }}>{hero.subtitle}</p>
            )}
            {hero.showButton && heroButton && (
                <div style={{ marginTop: '16px' }}>
                    <a
                        href="#"
                        style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            borderRadius: 8,
                            background: heroButton.bgColor || '#ffffff',
                            color: heroButtonText,
                            fontWeight: 600,
                            textDecoration: 'none',
                            ...getButtonWidthStyle(heroButton),
                        }}
                    >
                        {heroButton.text || 'Learn More'}
                    </a>
                </div>
            )}
        </>
    )

    return (
        <div className="preview-frame" style={{ padding: '16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '12px', color: '#999' }}>Email preview (table layout)</div>
            <table role="presentation" cellPadding="0" cellSpacing="0" style={{ width: '100%', maxWidth: 700, margin: '0 auto', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                        <td style={{ padding: '16px', background: navbar.bgColor, color: navbarText, textAlign: navJustify }}>
                            <div style={{ display: hasSecondary ? 'flex' : 'inline-flex', alignItems: 'center', justifyContent: hasSecondary ? 'space-between' : navFlex, gap: '8px' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    {navbar.logo ? <img src={navbar.logo} alt="Logo" style={{ height: 36 }} /> : <strong>Brand</strong>}
                                </span>
                                {hasSecondary && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                        <img src={navbar.secondaryLogo} alt="Secondary logo" style={{ height: 32 }} />
                                    </span>
                                )}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td
                            style={{
                                padding: `${hero.paddingY || 32}px 24px`,
                                color: heroText,
                                background: hero.type === 'color' ? hero.bgColor : undefined,
                                backgroundImage: hero.type === 'image' ? `url(${hero.bgImage})` : undefined,
                                backgroundSize: hero.type === 'image' ? 'cover' : undefined,
                                backgroundPosition: hero.type === 'image' ? 'center' : undefined,
                                textAlign: hasHeroImage ? 'left' : (hero.align === 'center' ? 'center' : hero.align === 'end' ? 'right' : 'left'),
                            }}
                        >
                            {hasHeroImage ? (
                                <table role="presentation" cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: '55%', verticalAlign: 'middle', paddingRight: '20px' }}>
                                                {renderHeroContent()}
                                            </td>
                                            <td style={{ width: '45%', verticalAlign: 'middle' }}>
                                                <img src={hero.heroImage} alt="Hero" style={{ width: '100%', maxWidth: '280px', height: 'auto', borderRadius: 8 }} />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            ) : (
                                renderHeroContent()
                            )}
                        </td>
                    </tr>
                    {thumbnail.image && (
                        <tr>
                            <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                <img
                                    src={thumbnail.image}
                                    alt="Thumbnail"
                                    style={{ width: '100%', maxWidth: thumbWidth, height: 'auto', borderRadius: 8 }}
                                />
                            </td>
                        </tr>
                    )}
                    <tr>
                        <td
                            style={{
                                padding: `${abstractPaddingY}px 24px`,
                                fontSize: 15,
                                lineHeight: 1.6,
                                textAlign: abstractAlign === 'center' ? 'center' : abstractAlign === 'end' ? 'right' : 'left',
                            }}
                        >
                            <div dangerouslySetInnerHTML={{ __html: abstract }} />
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: '12px 24px', textAlign: 'center' }}>
                            <a
                                href="#"
                                style={{
                                    display: 'inline-block',
                                    padding: '14px 24px',
                                    borderRadius: 8,
                                    background: button.bgColor,
                                    color: buttonText,
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    ...getButtonWidthStyle(button),
                                }}
                            >
                                {button.text}
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: '0 24px' }}>
                            <div style={{ borderBottom: `${divider.thickness}px solid ${divider.color}`, width: '100%' }} />
                        </td>
                    </tr>
                    <tr>
                        <td
                            style={{
                                padding: `${footer.paddingY || 20}px 24px`,
                                background: footer.bgColor,
                                color: footer.textColor || autoTextColor(footer.bgColor),
                                textAlign: footer.align === 'center' ? 'center' : footer.align === 'end' ? 'right' : 'left',
                                whiteSpace: 'pre-line',
                            }}
                        >
                            <p style={{ margin: 0 }}>{footer.text}</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

NewsletterRenderer.propTypes = {
    state: PropTypes.object.isRequired,
}

export default NewsletterRenderer
