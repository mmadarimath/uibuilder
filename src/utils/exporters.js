import { autoTextColor } from "./color";

const defaultCountries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "Australia",
];

const baseReset = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }
`;

export const generateLandingHtml = (state) => {
  const { layout, navbar, hero, heroButton, content, form, footer } = state;

  const containerClass = layout.fluid ? "container-fluid" : "container";
  const textOnNavbar = autoTextColor(navbar.bgColor);
  const textOnHero =
    hero.titleColor ||
    autoTextColor(hero.type === "color" ? hero.bgColor : "#111");
  const heroBtnTextColor =
    heroButton.textColor ||
    autoTextColor(heroButton.bgColor, "#ffffff", "#111111");
  const formButtonTextColor =
    form.button.textColor ||
    autoTextColor(form.button.bgColor, "#ffffff", "#111111");
  const stackInputs = form.stackInputs !== false;
  const panelBgType = form.panelBgType || "color";
  const panelBgColor = form.panelBgColor || "#ffffff";
  const panelBgImage = form.panelBgImage;
  const hasPanelImage = panelBgType === "image" && Boolean(panelBgImage);
  const panelTextColor =
    form.panelTextColor ||
    (hasPanelImage
      ? "#ffffff"
      : autoTextColor(panelBgColor, "#162d3d", "#ffffff"));
  const accentColor = form.button.bgColor || heroButton.bgColor || "#000000";

  const linkifyLegalText = (text = "") => {
    const tokens = {
      __PRIVACY_POLICY__: `<a href="#privacy" target="_blank" rel="noreferrer" style="color:${accentColor};text-decoration:underline;">Privacy Policy</a>`,
      __TERMS_OF_SERVICE__: `<a href="#terms" target="_blank" rel="noreferrer" style="color:${accentColor};text-decoration:underline;">Terms of Service</a>`,
      __TERMS_AND_CONDITIONS__: `<a href="#terms" target="_blank" rel="noreferrer" style="color:${accentColor};text-decoration:underline;">Terms and Conditions</a>`,
      __TERMS__: `<a href="#terms" target="_blank" rel="noreferrer" style="color:${accentColor};text-decoration:underline;">Terms</a>`,
    };
    return (text || "")
      .replace(/terms and conditions/gi, "__TERMS_AND_CONDITIONS__")
      .replace(/terms of service/gi, "__TERMS_OF_SERVICE__")
      .replace(/privacy policy/gi, "__PRIVACY_POLICY__")
      .replace(/\bterms\b/gi, "__TERMS__")
      .replace(
        /__TERMS_AND_CONDITIONS__|__TERMS_OF_SERVICE__|__PRIVACY_POLICY__|__TERMS__/g,
        (match) => tokens[match] || match,
      );
  };

  const panelPadding = form.panelPadding ?? 24;
  const panelMargin = form.panelMargin ?? 0;

  const buttonWidthStyle = (width) => {
    if (width === "lg") return "min-width:220px;";
    if (width === "sm") return "min-width:140px;";
    return "min-width:180px;";
  };

  const parseLines = (text = "") =>
    text
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);

  const customFields = (form.customQuestions || []).map((q) => {
    const options = parseLines(q.optionsText || "").length
      ? parseLines(q.optionsText || "")
      : q.type === "country"
        ? defaultCountries
        : [];
    return {
      id: `custom-${q.id}`,
      type:
        q.type === "country"
          ? "country"
          : q.type === "checkboxGroup"
            ? "checkboxGroup"
            : "select",
      label: q.label || "Custom question",
      options,
      showLabel: true,
      name: q.label
        ? q.label.toLowerCase().replace(/\s+/g, "")
        : `custom-${q.id}`,
    };
  });

  const baseFields = [...form.fields, ...customFields];

  const primaryCountry = baseFields.find((f) => f.type === "country");
  const userStateFields = baseFields.filter((f) => f.type === "state");
  const shouldAutoState = primaryCountry && userStateFields.length === 0;
  const autoStateField = shouldAutoState
    ? {
        id: "auto-state",
        type: "state",
        label: "State / Province",
        showLabel: true,
        dependsOn: primaryCountry.id,
        stateMap: {
          "United States": ["California", "New York", "Texas", "Florida"],
          Canada: ["Ontario", "Quebec", "British Columbia"],
          "United Kingdom": ["England", "Scotland", "Wales"],
        },
      }
    : null;
  const allFields = autoStateField
    ? [...baseFields, autoStateField]
    : baseFields;

  const stateMappings = [];
  const inputFields = allFields.filter(
    (f) =>
      f.type !== "checkbox" && f.type !== "optIn" && f.type !== "checkboxGroup",
  );
  const bottomFields = allFields.filter(
    (f) =>
      f.type === "checkbox" || f.type === "optIn" || f.type === "checkboxGroup",
  );

  const renderField = (field) => {
    const showLabel = field.showLabel !== false;
    const fieldName = field.name || field.id;
    const colClass = stackInputs ? "col-md-6" : "col-12";

    if (field.type === "select" || field.type === "country") {
      const options = (
        field.options && field.options.length
          ? field.options
          : field.type === "country"
            ? defaultCountries
            : []
      )
        .map((opt) => `<option>${opt}</option>`)
        .join("");
      return `<div class="${colClass} mb-3">
        ${showLabel ? `<label class="form-label" for="${field.id}">${field.label}</label>` : ""}
        <select class="form-select" id="${field.id}" name="${fieldName}" data-country="1"><option value="">Select...</option>${options}</select>
      </div>`;
    }

    if (field.type === "state") {
      if (field.dependsOn) {
        stateMappings.push({
          id: field.id,
          dependsOn: field.dependsOn,
          map: field.stateMap || {},
        });
      }
      return `<div class="${colClass} mb-3">
        ${showLabel ? `<label class="form-label" for="${field.id}">${field.label}</label>` : ""}
        <select class="form-select" id="${field.id}" name="${fieldName}" data-depends="${field.dependsOn || ""}" data-map='${JSON.stringify(field.stateMap || {})}'>
          <option value="">Select country first</option>
        </select>
      </div>`;
    }

    if (field.type === "checkboxGroup") {
      const items =
        field.options && field.options.length
          ? field.options
          : ["Option 1", "Option 2"];
      const checkboxes = items
        .map(
          (opt) =>
            `<div class="form-check"><input class="form-check-input" type="checkbox" id="${field.id}-${opt}" name="${fieldName}[]" /><label class="form-check-label" for="${field.id}-${opt}">${opt}</label></div>`,
        )
        .join("");
      return `<div class="${colClass} mb-3">${showLabel ? `<label class="form-label">${field.label}</label>` : ""}${checkboxes}</div>`;
    }

    return `<div class="${colClass} mb-3">
      ${showLabel ? `<label class="form-label" for="${field.id}">${field.label}</label>` : ""}
      <input class="form-control" type="${field.type}" id="${field.id}" name="${fieldName}" placeholder="${field.placeholder || ""}" />
    </div>`;
  };

  const inputFieldsHtml = inputFields.map(renderField).join("");
  const bottomFieldsHtml = bottomFields
    .map((field) => {
      const showLabel = field.showLabel !== false;
      const fieldName = field.name || field.id;

      if (field.type === "checkboxGroup") {
        const items =
          field.options && field.options.length
            ? field.options
            : ["Option 1", "Option 2"];
        const checks = items
          .map(
            (opt) =>
              `<div class="form-check"><input class="form-check-input" type="checkbox" id="${field.id}-${opt}" name="${fieldName}[]" /><label class="form-check-label" for="${field.id}-${opt}">${opt}</label></div>`,
          )
          .join("");
        return `<div class="mb-3">${showLabel ? `<div class="fw-semibold mb-2">${field.label}</div>` : ""}${checks}</div>`;
      }
      if (field.type === "optIn") {
        return `<div class="form-check mb-2">
          <input class="form-check-input" type="checkbox" id="${field.id}" name="${fieldName}" />
          ${showLabel ? `<label class="form-check-label" for="${field.id}">${linkifyLegalText(field.label)}</label>` : ""}
        </div>`;
      }
      return `<div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="${field.id}" name="${fieldName}" />
        ${showLabel ? `<label class="form-check-label" for="${field.id}">${field.label}</label>` : ""}
      </div>`;
    })
    .join("");

  const stateScript = stateMappings.length
    ? `<script>(function(){
      const mappings = ${JSON.stringify(stateMappings)};
      mappings.forEach((m)=>{
        const stateSel = document.getElementById(m.id);
        const countrySel = document.getElementById(m.dependsOn);
        if(!stateSel || !countrySel) return;
        const update = () => {
          const val = countrySel.value;
          const options = (m.map && m.map[val]) || [];
          stateSel.innerHTML = '<option value="">'+(val ? 'Select state/province' : 'Select country first')+'</option>' + options.map(o=>'<option>'+o+'</option>').join('');
          stateSel.disabled = !val;
        };
        countrySel.addEventListener('change', update);
        update();
      });
    })();</script>`
    : "";

  const heroStyle =
    hero.type === "color"
      ? `background:${hero.bgColor}; color:${textOnHero}; padding:${hero.paddingY || 48}px 0;`
      : `background:url(${hero.bgImage}) center/cover no-repeat; color:${textOnHero}; padding:${hero.paddingY || 48}px 0;`;

  const thumbnail = content.thumbnail
    ? `<img src="${content.thumbnail}" alt="Thumbnail" class="img-fluid rounded mb-3" />`
    : "";

  const thumbnailBlock =
    content.thumbPosition === "above"
      ? `${thumbnail}${content.abstract}`
      : `${content.abstract}${thumbnail}`;

  const logoHtml = navbar.logo
    ? `<img src="${navbar.logo}" alt="Logo" style="height:40px;" />`
    : '<span class="fw-semibold">Brand</span>';
  const navbarLogo = `<a href="${navbar.link || "#"}" class="d-inline-flex align-items-center text-decoration-none" style="color:inherit;">${logoHtml}</a>`;
  const secondaryLogo = navbar.secondaryLogo
    ? `<img src="${navbar.secondaryLogo}" alt="Secondary logo" style="height:36px;" />`
    : "";

  const navJustify =
    navbar.align === "center"
      ? "justify-content-center"
      : navbar.align === "end"
        ? "justify-content-end"
        : "justify-content-start";
  const hasSecondary = Boolean(navbar.secondaryLogo);
  const navClass = hasSecondary ? "justify-content-between" : navJustify;

  const footerLeftText = footer.leftText ?? footer.text;
  const footerRightText = footer.rightText ?? "";

  const heroButtonAlign =
    heroButton.align === "center"
      ? "justify-content-center"
      : heroButton.align === "end"
        ? "justify-content-end"
        : "justify-content-start";

  const formButtonAlign =
    form.button.align === "center"
      ? "justify-content-center"
      : form.button.align === "end"
        ? "justify-content-end"
        : "justify-content-start";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Landing Page</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
  :root {
    --accent-color: ${accentColor};
  }
  
  /* Smooth scroll */
  html { scroll-behavior: smooth; }
  
  /* Custom transitions */
  .fade-in { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .fade-in.visible { opacity: 1; transform: translateY(0); }
  
  .fade-in-left { opacity: 0; transform: translateX(-30px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .fade-in-left.visible { opacity: 1; transform: translateX(0); }
  
  .fade-in-right { opacity: 0; transform: translateX(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .fade-in-right.visible { opacity: 1; transform: translateX(0); }
  
  .scale-in { opacity: 0; transform: scale(0.95); transition: opacity 0.5s ease, transform 0.5s ease; }
  .scale-in.visible { opacity: 1; transform: scale(1); }
  
  /* Stagger delays */
  .delay-1 { transition-delay: 0.1s; }
  .delay-2 { transition-delay: 0.2s; }
  .delay-3 { transition-delay: 0.3s; }
  .delay-4 { transition-delay: 0.4s; }
  
  /* Layout */
  body { background: ${layout.fluid ? "#ffffff" : "#f8f9fa"}; }
  .page-wrapper { background: #ffffff; ${layout.fluid ? "" : "max-width: 1400px; margin: 0 auto; box-shadow: 0 0 40px rgba(0,0,0,0.05);"} }
  
  /* Navbar */
  .navbar-custom img { max-height: 40px; width: auto; object-fit: contain; transition: transform 0.3s ease; }
  .navbar-custom img:hover { transform: scale(1.05); }
  
  /* Hero */
  .hero-section h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 700; letter-spacing: -0.02em; }
  .hero-section p { font-size: 1.25rem; opacity: 0.9; }
  
  /* Cards & Panels */
  .form-card { 
    border: 1px solid #e5e7eb; 
    border-radius: 12px; 
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }
  .form-card:hover { box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12); }
  
  /* Sticky Form */
  .sticky-form { position: sticky; top: 24px; }
  
  /* Form Styles */
  .form-control, .form-select { 
    padding: 12px 16px; 
    border-radius: 8px; 
    border: 1px solid #e5e7eb;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .form-control:focus, .form-select:focus { 
    border-color: var(--accent-color); 
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }
  .form-label { font-weight: 500; color: #374151; margin-bottom: 6px; }
  
  .form-check-input { 
    width: 18px; 
    height: 18px; 
    margin-top: 2px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .form-check-input:checked { background-color: var(--accent-color); border-color: var(--accent-color); }
  .form-check-label { padding-left: 4px; color: #6b7280; }
  
  /* Buttons */
  .btn-custom {
    padding: 14px 32px;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    display: inline-block;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
  }
  .btn-custom:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); }
  .btn-custom:active { transform: translateY(0); }
  
  /* Content area */
  .content-area { line-height: 1.8; color: #374151; }
  .content-area h1, .content-area h2, .content-area h3 { color: #111827; margin-bottom: 16px; font-weight: 700; }
  .content-area p { margin-bottom: 16px; }
  .content-area ul, .content-area ol { padding-left: 24px; margin-bottom: 16px; }
  .content-area li { margin-bottom: 8px; }
  .content-area img { border-radius: 12px; margin: 16px 0; }
  
  /* Footer */
  footer a { transition: opacity 0.2s ease; }
  footer a:hover { opacity: 0.7; }
  
  /* Responsive */
  @media (max-width: 991px) {
    .sticky-form { position: relative; top: 0; }
  }
  </style>
</head>
<body>
  <div class="page-wrapper">
    <!-- Navbar -->
    <header class="navbar-custom fade-in" style="background:${navbar.bgColor}; color:${textOnNavbar};">
      <div class="${containerClass}">
        <nav class="d-flex align-items-center ${navClass} py-3">
          <div class="d-flex align-items-center gap-3">${navbarLogo}</div>
          ${secondaryLogo ? `<div class="d-flex align-items-center">${secondaryLogo}</div>` : ""}
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section" style="${heroStyle} text-align:${hero.align || "left"};">
      <div class="${containerClass}">
        <h1 class="fade-in delay-1" style="color:${textOnHero};">${hero.title}</h1>
        ${hero.showSubtitle && hero.subtitle ? `<p class="fade-in delay-2 mb-4" style="color:${textOnHero};">${hero.subtitle}</p>` : ""}
        ${
          hero.showButton
            ? `<div class="fade-in delay-3 d-flex ${heroButtonAlign}">
          <a href="#form-section" class="btn-custom" style="background:${heroButton.bgColor};color:${heroBtnTextColor};${buttonWidthStyle(heroButton.width)}">${heroButton.text || "Get Started"}</a>
        </div>`
            : ""
        }
      </div>
    </section>

    <!-- Main Content -->
    <main class="${containerClass} py-5" style="text-align:${content.align || "left"};" id="form-section">
      <div class="row g-4 g-lg-5">
        <!-- Content Column -->
        <div class="col-lg-6">
          <div class="content-area fade-in-left">${thumbnailBlock}</div>
        </div>
        
        <!-- Form Column -->
        <div class="col-lg-6">
          <div class="sticky-form">
            <div class="form-card scale-in p-4" style="background:${hasPanelImage ? "transparent" : panelBgColor};${hasPanelImage ? `background:url(${panelBgImage}) center/cover no-repeat;` : ""}color:${panelTextColor};padding:${panelPadding}px !important;margin:${panelMargin}px 0;">
              <h3 class="mb-4" style="text-align:${form.titleAlign || "left"}; color:${panelTextColor};">${form.title}</h3>
              <form>
                <div class="row">${inputFieldsHtml}</div>
                ${bottomFieldsHtml ? `<div class="mb-3">${bottomFieldsHtml}</div>` : ""}
                <div class="d-flex ${formButtonAlign} mt-3">
                  <button type="submit" name="${form.button.name || "submit"}" value="${form.button.value || "Download Now"}" class="btn-custom" style="background:${form.button.bgColor};color:${formButtonTextColor};${buttonWidthStyle(form.button.width)}">${form.button.text || "Submit"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer style="background:${footer.bgColor}; color:${footer.textColor || autoTextColor(footer.bgColor)}; padding:${footer.paddingY || 32}px 0; text-align:${footer.align || "center"};">
      <div class="${containerClass}">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <span>${footerLeftText}</span>
          ${footerRightText ? `<span style="opacity:0.8;">${footerRightText}</span>` : ""}
        </div>
      </div>
    </footer>
  </div>
  
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  ${stateScript}
  <script>
  // Smooth scroll animation on load and scroll
  (function(){
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);
    
    // Observe all animated elements
    document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
      observer.observe(el);
    });
    
    // Focus interactions
    document.querySelectorAll('input, select, textarea').forEach(el => {
      el.addEventListener('focus', () => el.style.borderColor = '${accentColor}');
      el.addEventListener('blur', () => el.style.borderColor = '#e5e7eb');
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  })();
  </script>
</body>
</html>`;
};

export const generateNewsletterHtml = (state) => {
  const ns = state.newsletter;
  const navbarColor = autoTextColor(ns.navbar.bgColor);
  const heroColor =
    ns.hero.titleColor ||
    autoTextColor(ns.hero.type === "color" ? ns.hero.bgColor : "#111");
  const btnColor = ns.button.textColor || autoTextColor(ns.button.bgColor);
  const heroBtnColor =
    ns.heroButton?.textColor ||
    autoTextColor(ns.heroButton?.bgColor || "#ffffff");
  const footerColor = ns.footer.textColor || autoTextColor(ns.footer.bgColor);
  const navTextAlign =
    ns.navbar.align === "center"
      ? "center"
      : ns.navbar.align === "end"
        ? "right"
        : "left";
  const navFlex =
    ns.navbar.align === "center"
      ? "center"
      : ns.navbar.align === "end"
        ? "flex-end"
        : "flex-start";
  const hasSecondary = Boolean(ns.navbar.secondaryLogo);
  const hasHeroImage = ns.hero.showImage && ns.hero.heroImage;

  const getButtonWidthStyle = (btn) => {
    if (btn?.width === "lg") return "min-width:220px;";
    if (btn?.width === "sm") return "min-width:140px;";
    return "min-width:180px;";
  };

  const heroBg =
    ns.hero.type === "color"
      ? `background-color:${ns.hero.bgColor};`
      : `background-image:url(${ns.hero.bgImage}); background-size:cover; background-position:center;`;

  const thumbWidth = ns.thumbnail.mode === "small" ? "360" : "660";

  const abstract = ns.abstract;

  // Convert newlines to <br> for footer text
  const footerText = (ns.footer.text || "").replace(/\n/g, "<br>");

  // Hero content HTML
  const heroContentHtml = `
    <h1 style="margin:0; font-size:26px; font-weight:700; line-height:1.3; color:${heroColor};">${ns.hero.title}</h1>
    ${ns.hero.showSubtitle && ns.hero.subtitle ? `<p style="margin:12px 0 0 0; font-size:16px; color:${heroColor}; opacity:0.9;">${ns.hero.subtitle}</p>` : ""}
    ${
      ns.hero.showButton && ns.heroButton
        ? `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
      <tr>
        <td>
          <a href="#" style="display:inline-block;padding:12px 24px;border-radius:8px;background:${ns.heroButton.bgColor || "#ffffff"};color:${heroBtnColor};text-decoration:none;font-weight:600;${getButtonWidthStyle(ns.heroButton)}">${ns.heroButton.text || "Learn More"}</a>
        </td>
      </tr>
    </table>`
        : ""
    }`;

  // Hero section - with or without image split
  const heroSection = hasHeroImage
    ? `
    <tr>
      <td style="${heroBg} padding:${ns.hero.paddingY || 32}px 24px;">
        <!--[if mso]>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
        <td width="55%" valign="middle" style="padding-right:20px;">
        <![endif]-->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;">
          <tr>
            <td width="55%" valign="middle" style="vertical-align:middle; padding-right:20px;">
              ${heroContentHtml}
            </td>
            <td width="45%" valign="middle" style="vertical-align:middle;">
              <img src="${ns.hero.heroImage}" alt="Hero" width="280" style="width:100%; max-width:280px; height:auto; border-radius:8px; display:block;" />
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td>
        <td width="45%" valign="middle">
        <img src="${ns.hero.heroImage}" alt="Hero" width="280" style="width:280px; height:auto; border-radius:8px;" />
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>`
    : `
    <tr>
      <td style="${heroBg} color:${heroColor}; padding:${ns.hero.paddingY || 32}px 24px; text-align:${ns.hero.align === "center" ? "center" : ns.hero.align === "end" ? "right" : "left"};">
        ${heroContentHtml}
      </td>
    </tr>`;

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="x-apple-disable-message-reformatting" />
<title>Newsletter</title>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
<style>
/* Reset */
body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
body { margin: 0 !important; padding: 0 !important; width: 100% !important; }

/* iOS blue links */
a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }

/* Gmail fix */
u + #body a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }

/* Responsive */
@media screen and (max-width: 600px) {
  .mobile-full { width: 100% !important; max-width: 100% !important; }
  .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
  .mobile-stack { display: block !important; width: 100% !important; }
  .mobile-center { text-align: center !important; }
  .mobile-img { width: 100% !important; max-width: 280px !important; margin: 16px auto 0 auto !important; }
}
</style>
</head>
<body id="body" style="margin:0; padding:0; background-color:#f4f4f5; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <!-- Preheader text (hidden) -->
  <div style="display:none; max-height:0; overflow:hidden;">&#8199;&#65279;&#847;</div>
  
  <!-- Outer wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:20px 10px;">
        
        <!-- Email container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="700" class="mobile-full" style="max-width:700px; width:100%; background-color:#ffffff; border-radius:8px; overflow:hidden;">
          
          <!-- Navbar -->
          <tr>
            <td style="padding:16px 24px; background-color:${ns.navbar.bgColor}; color:${navbarColor};" class="mobile-padding">
              ${
                hasSecondary
                  ? `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    ${ns.navbar.logo ? `<img src="${ns.navbar.logo}" alt="Logo" height="36" style="height:36px; width:auto; display:block;" />` : `<strong style="font-size:18px;">Brand</strong>`}
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <img src="${ns.navbar.secondaryLogo}" alt="Secondary logo" height="32" style="height:32px; width:auto; display:block;" />
                  </td>
                </tr>
              </table>`
                  : `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="${navTextAlign}">
                    ${ns.navbar.logo ? `<img src="${ns.navbar.logo}" alt="Logo" height="36" style="height:36px; width:auto; display:inline-block;" />` : `<strong style="font-size:18px;">Brand</strong>`}
                  </td>
                </tr>
              </table>`
              }
            </td>
          </tr>
          
          <!-- Hero Section -->
          ${heroSection}
          
          <!-- Thumbnail -->
          ${
            ns.thumbnail.image
              ? `
          <tr>
            <td align="center" style="padding:20px 24px;" class="mobile-padding">
              <img src="${ns.thumbnail.image}" alt="Thumbnail" width="${thumbWidth}" class="mobile-full" style="width:100%; max-width:${thumbWidth}px; height:auto; border-radius:8px; display:block;" />
            </td>
          </tr>`
              : ""
          }
          
          <!-- Abstract / Content -->
          <tr>
            <td style="padding:${ns.abstractPaddingY || 24}px 24px; font-size:15px; line-height:1.6; color:#111111; text-align:${ns.abstractAlign === "center" ? "center" : ns.abstractAlign === "end" ? "right" : "left"};" class="mobile-padding">
              ${abstract}
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:12px 24px;" class="mobile-padding">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="#" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="17%" strokecolor="${ns.button.bgColor}" fillcolor="${ns.button.bgColor}">
              <w:anchorlock/>
              <center style="color:${btnColor};font-family:sans-serif;font-size:15px;font-weight:600;">${ns.button.text}</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <a href="#" style="display:inline-block;padding:14px 28px;border-radius:8px;background-color:${ns.button.bgColor};color:${btnColor};text-decoration:none;font-weight:600;font-size:15px;${getButtonWidthStyle(ns.button)}">${ns.button.text}</a>
              <!--<![endif]-->
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding:0 24px;" class="mobile-padding">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="border-bottom:${ns.divider.thickness}px solid ${ns.divider.color}; font-size:1px; line-height:1px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:${ns.footer.paddingY || 20}px 24px; background-color:${ns.footer.bgColor}; color:${footerColor}; text-align:${ns.footer.align === "center" ? "center" : ns.footer.align === "end" ? "right" : "left"}; font-size:13px; line-height:1.5;" class="mobile-padding">
              ${footerText}
            </td>
          </tr>
          
        </table>
        <!-- /Email container -->
        
      </td>
    </tr>
  </table>
  <!-- /Outer wrapper -->
</body>
</html>`;
};
