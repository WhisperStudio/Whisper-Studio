import { useState, useMemo } from 'react';
import {
  FiArrowRight, FiCheck, FiCopy, FiDollarSign, FiPackage, FiRefreshCw, FiSliders,
  FiZap, FiMessageCircle, FiChevronDown, FiChevronUp, FiDatabase, FiShield, FiGlobe
} from 'react-icons/fi';
import { FaCcVisa, FaCcMastercard, FaPaypal } from 'react-icons/fa';
import Header from '../../components/header';
import Footer from '../../components/footer';
import './CSS/WebPage.css';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', minimumFractionDigits: 0 }).format(amount);

export default function WebDevPromoPage() {
  const [lang, setLang] = useState('no');
  const [country, setCountry] = useState('NO');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [previewMode, setPreviewMode] = useState('webside');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState('home');
  const [previewBackgroundEffect, setPreviewBackgroundEffect] = useState('default');

  const [inputs, setInputs] = useState({
    pages: 5,
    design: 'premium',     // 'standard' | 'premium' | 'elite'
    ecommerce: false,
    ecommerceLevel: 5,
    seo: true,
    carePlan: false,
    admin: false,
    adminLevel: 5,
    database: false,
    databaseLevel: 5,
    ai: false,
    gallery: false,
    galleryLevel: 5,
    viewer3D: false,
    viewer3DLevel: 5,
    customDesign: false,
    contactForm: false,
    blog: false,
    booking: false,
  });

  const translations = {
    no: {
      heroTitle: 'Moderne nettsider som konverterer',
      heroSubtitle: 'Fra idé til lansering. Vi bygger skreddersydde, lynraske og brukervennlige nettsider som styrker din merkevare og gir resultater.',
      configureProject: 'Konfigurer ditt prosjekt',
      pageCount: 'Antall sider',
      designComplexity: 'Design & kompleksitet',
      addons: 'Tilleggsfunksjoner',
      configuration: 'Konfigurasjon',
      ecommerceTitle: 'Nettbutikk', ecommerceDesc: 'Selg produkter eller tjenester',
      seoTitle: 'SEO & Analyse', seoDesc: 'Bli funnet på Google',
      careTitle: 'Drift & Vedlikehold', careDesc: 'Månedlig oppfølging',
      adminTitle: 'Admin Panel', adminDesc: 'Administrer innhold og brukere',
      databaseTitle: 'Database', databaseDesc: 'Lagre og håndtere data', databaseDescRequired: 'Påkrevd for nettbutikk', databaseComplexity: 'Database kompleksitet',
      aiTitle: 'AI Assistent', aiDesc: 'Smart chatbot og automatisering',
      galleryTitle: 'Galleri', galleryDesc: 'Bildegalleri med zoom og kategorier', galleryComplexity: 'Galleri kompleksitet',
      viewer3DTitle: '3D Visning', viewer3DDesc: 'Interaktiv 3D produktvisning', viewer3DComplexity: '3D Visning kompleksitet',
      customDesignTitle: 'Egendefinert Design', customDesignDesc: 'Skreddersydd design etter dine ønsker',
      contactFormTitle: 'Kontaktskjema', contactFormDesc: 'Profesjonelt kontaktskjema',
      blogTitle: 'Blogg', blogDesc: 'Bloggfunksjonalitet med CMS',
      bookingTitle: 'Booking System', bookingDesc: 'Timebestilling og kalender',
      ecommerceComplexity: 'Nettbutikk kompleksitet', adminComplexity: 'Admin panel kompleksitet',
      basic: 'Grunnleggende', advanced: 'Avansert',
      priceDisclaimer: 'Prisene kan variere basert på prosjektets kompleksitet. Send inn prosjektet ditt om du er usikker, så finner vi riktig konfigurasjon for deg.',
      estimateNote: 'Dette er et prisestimat', estimateTitle: 'Ditt prisestimat',
      estimatedCost: 'Estimert kostnad', estimatedWaitTime: 'Estimert ventetid',
      monthlyLabel: 'Månedlig kostnad', perMonth: '/mnd', weeks: 'uker',
      startProject: 'Start prosjektet', copy: 'Kopier', reset: 'Nullstill',
      costBreakdown: 'Kostnadsfordeling',
      selectCountry: 'Velg land for MVA-beregning:',
      priceBeforeVat: 'Pris før MVA:', vat: 'MVA', totalInclVat: 'Total inkl. MVA:', exVat: 'eks. mva',
      webside: 'Webside', adminPanel: 'Admin Panel'
    },
    en: {
      heroTitle: 'Modern websites that convert',
      heroSubtitle: 'From idea to launch. We build custom, blazing-fast and user-friendly websites that strengthen your brand and deliver results.',
      configureProject: 'Configure your project',
      pageCount: 'Number of pages',
      designComplexity: 'Design & complexity',
      addons: 'Add-ons',
      configuration: 'Configuration',
      ecommerceTitle: 'E-commerce', ecommerceDesc: 'Sell products or services',
      seoTitle: 'SEO & Analytics', seoDesc: 'Be found on Google',
      careTitle: 'Care & Maintenance', careDesc: 'Monthly follow-up',
      adminTitle: 'Admin Panel', adminDesc: 'Manage content and users',
      databaseTitle: 'Database', databaseDesc: 'Store and manage data', databaseDescRequired: 'Required for e-commerce', databaseComplexity: 'Database complexity',
      aiTitle: 'AI Assistant', aiDesc: 'Smart chatbot and automation',
      galleryTitle: 'Gallery', galleryDesc: 'Image gallery with zoom and categories', galleryComplexity: 'Gallery complexity',
      viewer3DTitle: '3D Viewer', viewer3DDesc: 'Interactive 3D product display', viewer3DComplexity: '3D Viewer complexity',
      customDesignTitle: 'Custom Design', customDesignDesc: 'Tailored design to your wishes',
      contactFormTitle: 'Contact Form', contactFormDesc: 'Professional contact form',
      blogTitle: 'Blog', blogDesc: 'Blog functionality with CMS',
      bookingTitle: 'Booking System', bookingDesc: 'Appointment booking and calendar',
      ecommerceComplexity: 'E-commerce complexity', adminComplexity: 'Admin panel complexity',
      basic: 'Basic', advanced: 'Advanced',
      priceDisclaimer: 'Prices may vary based on project complexity. Submit your project if you\'re unsure, and we\'ll find the right configuration for you.',
      estimateNote: 'This is a price estimate', estimateTitle: 'Your Price Estimate',
      estimatedCost: 'Estimated cost', estimatedWaitTime: 'Estimated wait time',
      monthlyLabel: 'Monthly cost', perMonth: '/mo', weeks: 'weeks',
      startProject: 'Start Project', copy: 'Copy', reset: 'Reset',
      costBreakdown: 'Cost breakdown',
      selectCountry: 'Select country for VAT calculation:',
      priceBeforeVat: 'Price before VAT:', vat: 'VAT', totalInclVat: 'Total incl. VAT:', exVat: 'ex. VAT',
      webside: 'Website', adminPanel: 'Admin Panel'
    }
  };
  const t = translations[lang];

  const vatRates = { NO: 25, SE: 25, DK: 25, FI: 24, DE: 19, FR: 20, UK: 20, US: 0 };
  const vatRate = vatRates[country] || 25;

  const priceMap = {
    base: 2200, perPage: 1300, design: { standard: 1, premium: 1.3, elite: 2.0 },
    ecommerce: { min: 2300, max: 9999 }, seo: 4500, carePlan: 1000,
    admin: { min: 2500, max: 9999 }, database: { min: 2000, max: 9999 }, ai: 6500,
    gallery: { min: 1500, max: 5500 }, viewer3D: { min: 3000, max: 12000 },
    customDesign: 8500, contactForm: 800, blog: 3500, booking: 4500,
  };
  const dyn = (min, max, level) => Math.round(min + ((max - min) * (level - 1) / 9));

  const breakdown = useMemo(() => {
    const dMul = priceMap.design[inputs.design] || 1;
    let oneTime = priceMap.base + inputs.pages * priceMap.perPage * dMul;

    const ecommerceCost = inputs.ecommerce ? dyn(priceMap.ecommerce.min, priceMap.ecommerce.max, inputs.ecommerceLevel) : 0;
    const adminCost = inputs.admin ? dyn(priceMap.admin.min, priceMap.admin.max, inputs.adminLevel) : 0;
    const databaseCost = inputs.database ? dyn(priceMap.database.min, priceMap.database.max, inputs.databaseLevel) : 0;
    const galleryCost = inputs.gallery ? dyn(priceMap.gallery.min, priceMap.gallery.max, inputs.galleryLevel) : 0;
    const viewerCost = inputs.viewer3D ? dyn(priceMap.viewer3D.min, priceMap.viewer3D.max, inputs.viewer3DLevel) : 0;

    if (inputs.ecommerce) oneTime += ecommerceCost;
    if (inputs.seo) oneTime += priceMap.seo;
    if (inputs.admin) oneTime += adminCost;
    if (inputs.database) oneTime += databaseCost;
    if (inputs.ai) oneTime += priceMap.ai;
    if (inputs.gallery) oneTime += galleryCost;
    if (inputs.viewer3D) oneTime += viewerCost;
    if (inputs.customDesign) oneTime += priceMap.customDesign;
    if (inputs.contactForm) oneTime += priceMap.contactForm;
    if (inputs.blog) oneTime += priceMap.blog;
    if (inputs.booking) oneTime += priceMap.booking;

    const monthly = inputs.carePlan ? priceMap.carePlan : 0;
    const weeks = Math.round(
      2 + (inputs.pages / 4) + (inputs.ecommerce ? 3 : 0) + (inputs.seo ? 1 : 0) +
      (inputs.admin ? 2 : 0) + (inputs.database ? 1 : 0) + (inputs.ai ? 2 : 0) +
      (inputs.gallery ? 1 : 0) + (inputs.viewer3D ? 2 : 0) + (inputs.customDesign ? 3 : 0) +
      (inputs.blog ? 2 : 0) + (inputs.booking ? 1 : 0)
    );

    const items = [
      { name: 'Grunnpakke', cost: priceMap.base },
      { name: `${inputs.pages} sider (${inputs.design})`, cost: inputs.pages * priceMap.perPage * dMul },
    ];
    if (inputs.ecommerce) items.push({ name: 'Nettbutikk', cost: ecommerceCost });
    if (inputs.seo) items.push({ name: 'SEO & Analyse', cost: priceMap.seo });
    if (inputs.admin) items.push({ name: 'Admin Panel', cost: adminCost });
    if (inputs.database) items.push({ name: 'Database', cost: databaseCost });
    if (inputs.ai) items.push({ name: 'AI Assistent', cost: priceMap.ai });
    if (inputs.gallery) items.push({ name: 'Galleri', cost: galleryCost });
    if (inputs.viewer3D) items.push({ name: '3D Visning', cost: viewerCost });
    if (inputs.customDesign) items.push({ name: 'Egendefinert Design', cost: priceMap.customDesign });
    if (inputs.contactForm) items.push({ name: 'Kontaktskjema', cost: priceMap.contactForm });
    if (inputs.blog) items.push({ name: 'Blogg', cost: priceMap.blog });
    if (inputs.booking) items.push({ name: 'Booking System', cost: priceMap.booking });

    const vatAmount = oneTime * (vatRate / 100);
    return { oneTimeCost: oneTime, monthlyCost: monthly, weeks, items, vatAmount, totalWithVat: oneTime + vatAmount, vatRate };
  }, [inputs, vatRate, priceMap.admin.max, priceMap.admin.min, priceMap.ai, priceMap.base, priceMap.blog, priceMap.booking, priceMap.carePlan, priceMap.contactForm, priceMap.customDesign, priceMap.database.max, priceMap.database.min, priceMap.design, priceMap.ecommerce.max, priceMap.ecommerce.min, priceMap.gallery.max, priceMap.gallery.min, priceMap.perPage, priceMap.seo, priceMap.viewer3D.max, priceMap.viewer3D.min]);

  const updateInput = (key, value) => {
    setInputs(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'ecommerce' && value) { next.database = true; setActiveFeature('ecommerce'); }
      if (key === 'database' && value === false && prev.ecommerce) next.ecommerce = false;
      if (key === 'gallery' && value) setActiveFeature('gallery');
      if (key === 'viewer3D' && value) setActiveFeature('viewer3D');
      if (key === 'customDesign' && value) setActiveFeature('customDesign');
      if (value === false && activeFeature === key) setActiveFeature('home');
      return next;
    });
  };

  const copyEstimate = () => {
    const text = `Estimat for nettsideprosjekt:
-----------------------------
Engangskostnad: ${formatCurrency(breakdown.oneTimeCost)} eks. mva
Total inkl. MVA: ${formatCurrency(breakdown.totalWithVat)}
Månedlig kostnad: ${formatCurrency(breakdown.monthlyCost)}/mnd
Estimert tidslinje: ~${breakdown.weeks} uker

Konfigurasjon:
- Sider: ${inputs.pages}
- Design: ${inputs.design}
- Nettbutikk: ${inputs.ecommerce ? 'Ja' : 'Nei'}
- SEO & Analyse: ${inputs.seo ? 'Ja' : 'Nei'}
- Admin Panel: ${inputs.admin ? 'Ja' : 'Nei'}
- Database: ${inputs.database ? 'Ja' : 'Nei'}
- Drift & Vedlikehold: ${inputs.carePlan ? 'Ja' : 'Nei'}`;
    navigator.clipboard.writeText(text.trim());
    alert('Estimat kopiert til utklippstavlen!');
  };

  const resetCalculator = () => {
    setInputs({
      pages: 5, design: 'premium', ecommerce: false, ecommerceLevel: 5, seo: true, carePlan: false,
      admin: false, adminLevel: 5, database: false, databaseLevel: 5, ai: false,
      gallery: false, galleryLevel: 5, viewer3D: false, viewer3DLevel: 5,
      customDesign: false, contactForm: false, blog: false, booking: false,
    });
    setShowBreakdown(false);
    setPreviewMode('webside');
    setMenuOpen(false);
    setActiveFeature('home');
    setPreviewBackgroundEffect('default');
  };

  const tDesignClass = `design-${inputs.design}`;
  const bgEffectClass = previewBackgroundEffect !== 'default' ? `bg-${previewBackgroundEffect}` : '';

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <main className="content">
          <div className="lang-switch">
            <button className={`lang ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`lang ${lang === 'no' ? 'active' : ''}`} onClick={() => setLang('no')}>NO</button>
          </div>

          <section className="hero">
            <h1 className="hero-title">{t.heroTitle}</h1>
            <p className="hero-sub">{t.heroSubtitle}</p>
          </section>

          <div className="grid">
            {/* LEFT: Calculator */}
            <div className="panel glass">
              <h2 className="section-title"><FiSliders /> {t.configureProject}</h2>

              {/* Pages */}
              <div className="group">
                <label className="label">
                  {t.pageCount}
                  <span className="value">{inputs.pages}</span>
                </label>
                <input
                  className="slider"
                  type="range" min="1" max="20"
                  value={inputs.pages}
                  onChange={(e) => updateInput('pages', parseInt(e.target.value))}
                />
              </div>

              {/* Design */}
              <div className="group">
                <label className="label">{t.designComplexity}</label>
                <div className="toggle-grid">
                  {['standard', 'premium', 'elite'].map(level => (
                    <label key={level} className={`toggle ${inputs.design === level ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={inputs.design === level}
                        onChange={() => updateInput('design', level)}
                      />
                      <span className="toggle-title">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Addons */}
              <div className="group">
                <label className="label">{t.addons}</label>
                <div className="toggle-grid">
                  <label className={`toggle ${inputs.ecommerce ? 'checked' : ''}`}>
                    <input type="checkbox" checked={inputs.ecommerce} onChange={(e) => updateInput('ecommerce', e.target.checked)} />
                    <span className="toggle-title">{t.ecommerceTitle} <FiPackage /></span>
                    <span className="toggle-desc">{t.ecommerceDesc}</span>
                  </label>
                  <label className={`toggle ${inputs.seo ? 'checked' : ''}`}>
                    <input type="checkbox" checked={inputs.seo} onChange={(e) => updateInput('seo', e.target.checked)} />
                    <span className="toggle-title">{t.seoTitle} <FiZap /></span>
                    <span className="toggle-desc">{t.seoDesc}</span>
                  </label>
                  <label className={`toggle ${inputs.carePlan ? 'checked' : ''}`}>
                    <input type="checkbox" checked={inputs.carePlan} onChange={(e) => updateInput('carePlan', e.target.checked)} />
                    <span className="toggle-title">{t.careTitle} <FiCheck /></span>
                    <span className="toggle-desc">{t.careDesc}</span>
                  </label>
                </div>
              </div>

              {/* Configuration */}
              <div className="group">
                <label className="label">{t.configuration}</label>
                <div className="toggle-grid">
                  <label className={`toggle ${inputs.admin ? 'checked' : ''}`}>
                    <input type="checkbox" checked={inputs.admin} onChange={(e) => updateInput('admin', e.target.checked)} />
                    <span className="toggle-title">{t.adminTitle} <FiShield /></span>
                    <span className="toggle-desc">{t.adminDesc}</span>
                  </label>
                  <label className={`toggle ${inputs.database ? 'checked' : ''} ${inputs.ecommerce ? 'disabled' : ''}`}>
                    <input
                      type="checkbox"
                      checked={inputs.database}
                      disabled={inputs.ecommerce}
                      onChange={(e) => updateInput('database', e.target.checked)}
                    />
                    <span className="toggle-title">{t.databaseTitle} <FiDatabase /></span>
                    <span className="toggle-desc">{inputs.ecommerce ? t.databaseDescRequired : t.databaseDesc}</span>
                  </label>
                  <label className={`toggle ${inputs.ai ? 'checked' : ''}`}>
                    <input type="checkbox" checked={inputs.ai} onChange={(e) => updateInput('ai', e.target.checked)} />
                    <span className="toggle-title">{t.aiTitle} <FiZap /></span>
                    <span className="toggle-desc">{t.aiDesc}</span>
                  </label>
                </div>
              </div>

              {/* Extra features */}
              <div className="group">
                <label className="label">Ekstra Funksjoner</label>
                <div className="toggle-grid">
                  {[
                    ['gallery', t.galleryTitle, t.galleryDesc],
                    ['viewer3D', t.viewer3DTitle, t.viewer3DDesc],
                    ['customDesign', t.customDesignTitle, t.customDesignDesc],
                    ['contactForm', t.contactFormTitle, t.contactFormDesc],
                    ['blog', t.blogTitle, t.blogDesc],
                    ['booking', t.bookingTitle, t.bookingDesc],
                  ].map(([key, title, desc]) => (
                    <label key={key} className={`toggle ${inputs[key] ? 'checked' : ''}`}>
                      <input type="checkbox" checked={inputs[key]} onChange={(e) => updateInput(key, e.target.checked)} />
                      <span className="toggle-title">{title}</span>
                      <span className="toggle-desc">{desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dynamic sliders for enabled features */}
              {(inputs.ecommerce || inputs.admin || (inputs.database && !inputs.ecommerce) || inputs.gallery || inputs.viewer3D) && (
                <div className="group">
                  {inputs.ecommerce && (
                    <div className="mini-group">
                      <label className="label">
                        {t.ecommerceComplexity}
                        <span className="value">{formatCurrency(dyn(priceMap.ecommerce.min, priceMap.ecommerce.max, inputs.ecommerceLevel))}</span>
                      </label>
                      <input className="slider" type="range" min="1" max="10" value={inputs.ecommerceLevel}
                             onChange={(e) => updateInput('ecommerceLevel', parseInt(e.target.value))}/>
                      <div className="scale-row"><span>{t.basic}</span><span>{t.advanced}</span></div>
                    </div>
                  )}
                  {inputs.admin && (
                    <div className="mini-group">
                      <label className="label">
                        {t.adminComplexity}
                        <span className="value">{formatCurrency(dyn(priceMap.admin.min, priceMap.admin.max, inputs.adminLevel))}</span>
                      </label>
                      <input className="slider" type="range" min="1" max="10" value={inputs.adminLevel}
                             onChange={(e) => updateInput('adminLevel', parseInt(e.target.value))}/>
                      <div className="scale-row"><span>{t.basic}</span><span>{t.advanced}</span></div>
                    </div>
                  )}
                  {inputs.database && !inputs.ecommerce && (
                    <div className="mini-group">
                      <label className="label">
                        {t.databaseComplexity}
                        <span className="value">{formatCurrency(dyn(priceMap.database.min, priceMap.database.max, inputs.databaseLevel))}</span>
                      </label>
                      <input className="slider" type="range" min="1" max="10" value={inputs.databaseLevel}
                             onChange={(e) => updateInput('databaseLevel', parseInt(e.target.value))}/>
                      <div className="scale-row"><span>{t.basic}</span><span>{t.advanced}</span></div>
                    </div>
                  )}
                  {inputs.gallery && (
                    <div className="mini-group">
                      <label className="label">
                        {t.galleryComplexity}
                        <span className="value">{formatCurrency(dyn(priceMap.gallery.min, priceMap.gallery.max, inputs.galleryLevel))}</span>
                      </label>
                      <input className="slider" type="range" min="1" max="10" value={inputs.galleryLevel}
                             onChange={(e) => updateInput('galleryLevel', parseInt(e.target.value))}/>
                      <div className="scale-row"><span>{t.basic}</span><span>{t.advanced}</span></div>
                    </div>
                  )}
                  {inputs.viewer3D && (
                    <div className="mini-group">
                      <label className="label">
                        {t.viewer3DComplexity}
                        <span className="value">{formatCurrency(dyn(priceMap.viewer3D.min, priceMap.viewer3D.max, inputs.viewer3DLevel))}</span>
                      </label>
                      <input className="slider" type="range" min="1" max="10" value={inputs.viewer3DLevel}
                             onChange={(e) => updateInput('viewer3DLevel', parseInt(e.target.value))}/>
                      <div className="scale-row"><span>{t.basic}</span><span>{t.advanced}</span></div>
                    </div>
                  )}
                </div>
              )}

              <p className="disclaimer">💡 {t.priceDisclaimer}</p>
            </div>

            {/* RIGHT: Preview + Results */}
            <div>
              {/* Preview */}
              <div className="preview glass">
                <div className="mock-header">
                  <span className="mock-dot red"></span>
                  <span className="mock-dot yellow"></span>
                  <span className="mock-dot green"></span>
                </div>

                {inputs.admin && (
                  <div className="view-switch">
                    <button className={`view-btn ${previewMode === 'webside' ? 'active' : ''}`} onClick={() => setPreviewMode('webside')}>
                      <FiGlobe /> {t.webside}
                    </button>
                    <button className={`view-btn ${previewMode === 'admin' ? 'active' : ''}`} onClick={() => setPreviewMode('admin')}>
                      <FiShield /> {t.adminPanel}
                    </button>
                  </div>
                )}

                {previewMode === 'admin' && inputs.admin ? (
                  <div className="admin-panel">
                    <div className="admin-header">
                      <h3>Admin Dashboard</h3>
                      <span className="muted">v2.0</span>
                    </div>
                    <div className="stats">
                      {[
                        ['Besøkende i dag', '1,284'],
                        ['Ordrer', '47'],
                        ['Omsetning', 'kr 28,450'],
                        ['Konvertering', '3.7%']
                      ].map(([k, v], i) => (
                        <div key={i} className="stat">
                          <h4>{k}</h4><p>{v}</p>
                        </div>
                      ))}
                    </div>
                    <div className="admin-menu">
                      <div className="admin-item"><FiPackage/> Produkter</div>
                      <div className="admin-item"><FiSliders/> Innstillinger</div>
                      <div className="admin-item"><FiDatabase/> Database</div>
                    </div>
                  </div>
                ) : (
                  <div className={`mock-site ${tDesignClass} ${bgEffectClass}`}>
                    <div className="site-inner">
                      <div className="site-top">
                        <div className="site-logo">Logo</div>

                        <nav className="site-nav">
                          {/* Auto-add feature links */}
                          {(() => {
                            const features = [];
                            if (inputs.ecommerce) features.push({ id: 'ecommerce', label: '🛒 Nettbutikk' });
                            if (inputs.gallery) features.push({ id: 'gallery', label: '🖼️ Galleri' });
                            if (inputs.viewer3D) features.push({ id: 'viewer3D', label: '🎮 3D Visning' });
                            if (inputs.customDesign) features.push({ id: 'customDesign', label: '✨ Custom Design' });
                            if (inputs.blog) features.push({ id: 'blog', label: '📝 Blogg' });
                            if (inputs.contactForm) features.push({ id: 'contactForm', label: '📧 Kontakt' });
                            if (inputs.booking) features.push({ id: 'booking', label: '📅 Booking' });

                            const remaining = Math.max(0, inputs.pages - 1 - features.length);
                            const navItems = [
                              ...features.map(f => (
                                <span key={f.id} className="nav-link" onClick={() => setActiveFeature(f.id)}>{f.label}</span>
                              )),
                              ...Array.from({ length: remaining }, (_, i) => (
                                <span key={`p-${i}`} className="nav-link">Side {features.length + i + 2}</span>
                              ))
                            ];

                            if (navItems.length > 5) {
                              return (
                                <div className="hambox">
                                  <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
                                    <span/><span/><span/>
                                  </button>
                                  {menuOpen && (
                                    <div className={`dropdown ${tDesignClass}`}>
                                      {navItems.map((n, i) => (
                                        <div key={i} className="menu-item" onClick={() => n.props?.onClick?.()}>{n.props?.children || n}</div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            return navItems;
                          })()}

                          {inputs.ecommerce && (
                            <div className={`cart ${tDesignClass}`}>
                              <span className="cart-ico">🛒<span className={`badge ${tDesignClass}`}>3</span></span>
                              <span className="cart-text">kr 2,499</span>
                            </div>
                          )}
                        </nav>
                      </div>

                      {/* Content */}
                      {activeFeature === 'gallery' && inputs.gallery ? (
                        <div className="gallery">
                          {[
                            'linear-gradient(135deg, #ddd6fe, #e0e7ff)',
                            'linear-gradient(135deg, #fce7f3, #fbcfe8)',
                            'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                            'linear-gradient(135deg, #fef3c7, #fde68a)',
                            'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                            'linear-gradient(135deg, #fecaca, #fca5a5)',
                          ].map((c, i) => <div key={i} className={`g-img ${tDesignClass}`} style={{ background: c }} />)}
                        </div>
                      ) : activeFeature === 'viewer3D' && inputs.viewer3D ? (
                        <div className="viewer3d">
                          <div className="viewer-canvas">🎮<span className="badge-360">360°</span></div>
                          <div className="viewer-controls">
                            <button>↻ Roter</button><button>🔍 Zoom</button><button>⚙️ Innstillinger</button>
                          </div>
                          <p className="muted center">
                            Interaktiv 3D-visning lar kundene dine utforske produkter fra alle vinkler.
                            Perfekt for møbler, smykker, elektronikk og mer!
                          </p>
                        </div>
                      ) : activeFeature === 'customDesign' && inputs.customDesign ? (
                        <div className="custom-design">
                          <h3 className="cd-title">Egendefinert Design</h3>
                          <p className="cd-note">Vi lager dine ønsker så langt det er oppnåelig! Her er noen eksempler:</p>
                          <div className="cd-grid">
                            {[
                              ['🎨 Unike Fargepaletter', 'Skreddersydde farger som matcher din merkevare perfekt'],
                              ['🖼️ Custom Layouts', 'Helt unike sidestrukturer designet for ditt innhold'],
                              ['✨ Spesialeffekter', 'Parallax, partikler, og andre wow-effekter'],
                              ['🎭 Interaktive Elementer', 'Hover-effekter, animasjoner og mikro-interaksjoner'],
                              ['📱 Responsivt Design', 'Perfekt tilpasset alle skjermstørrelser'],
                              ['🎯 Konverteringsoptimalisering', 'Design som driver resultater og salg'],
                            ].map(([h, p], i) => (
                              <div key={i} className="cd-option">
                                <h4>{h}</h4><p>{p}</p>
                              </div>
                            ))}
                          </div>
                          <p className="cd-note"><strong>Prøv bakgrunnseffekter:</strong></p>
                          <div className="bg-buttons">
                            <button className={`bg-btn ${previewBackgroundEffect==='default'?'active':''}`} onClick={() => setPreviewBackgroundEffect('default')}>🌐 Standard</button>
                            <button className={`bg-btn ${previewBackgroundEffect==='stars'?'active':''}`} onClick={() => setPreviewBackgroundEffect('stars')}>⭐ Stjerner</button>
                            <button className={`bg-btn ${previewBackgroundEffect==='wave'?'active':''}`} onClick={() => setPreviewBackgroundEffect('wave')}>🌊 Gradient Wave</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="hero-mock">
                            <h2 className={`mock-title ${tDesignClass}`}>
                              {activeFeature === 'ecommerce' && inputs.ecommerce
                                ? 'Nettbutikk'
                                : inputs.design === 'standard' ? 'Moderne Nettside'
                                : inputs.design === 'premium' ? 'Premium Opplevelse'
                                : 'Elite Performance'}
                            </h2>
                            <p className={`mock-sub ${tDesignClass}`}>
                              {activeFeature === 'ecommerce' && inputs.ecommerce ? 'Handle trygt og enkelt online' : 'Profesjonell nettside for din bedrift'}
                            </p>
                            <span className={`mock-btn ${tDesignClass}`}>{activeFeature === 'ecommerce' && inputs.ecommerce ? 'Se produkter' : 'Kom i gang'}</span>
                          </div>

                          {activeFeature === 'ecommerce' && inputs.ecommerce ? (
                            <>
                              <div className="product-grid">
                                {[
                                  { name: 'Produkt 1', price: 'kr 799', c1: '#ddd6fe', c2: '#e0e7ff' },
                                  { name: 'Produkt 2', price: 'kr 899', c1: '#fce7f3', c2: '#fbcfe8' },
                                  { name: 'Produkt 3', price: 'kr 699', c1: '#dbeafe', c2: '#bfdbfe' },
                                ].map((p, i) => (
                                  <div key={i} className={`product ${tDesignClass}`}>
                                    <div className={`p-img ${tDesignClass}`} style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }}/>
                                    <div className="p-info">
                                      <h4 className={`p-name ${tDesignClass}`}>{p.name}</h4>
                                      <p className={`p-price ${tDesignClass}`}>{p.price}</p>
                                    </div>
                                    <button className={`p-add ${tDesignClass}`}>Legg i handlekurv</button>
                                  </div>
                                ))}
                              </div>

                              <div className={`payments ${tDesignClass}`}>
                                <p className={`pay-label ${tDesignClass}`}>Sikre betalingsmetoder</p>
                                <div className="pay-icons">
                                  <span className={`pay-ico ${tDesignClass}`}><FaCcVisa /></span>
                                  <span className={`pay-ico ${tDesignClass}`}><FaCcMastercard /></span>
                                  <span className={`vipps ${tDesignClass}`}>Vipps</span>
                                  {(inputs.design !== 'standard') && (
                                    <span className={`pay-ico ${tDesignClass}`}><FaPaypal /></span>
                                  )}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="three-cards">
                              {[...Array(3)].map((_, i) => <div key={i} className={`tcard ${tDesignClass}`} />)}
                            </div>
                          )}
                        </>
                      )}

                      {inputs.ai
                        ? <div className={`ai-btn ${tDesignClass}`}><span className="ai-ico">🤖</span></div>
                        : inputs.design === 'elite' && <div className="chat-fab"><FiMessageCircle color="#fff" size={24}/></div>}
                    </div>
                  </div>
                )}
              </div>

              {/* Results */}
              <div className="panel glass sticky">
                <h2 className="section-title"><FiDollarSign /> {t.estimateTitle}</h2>
                <span className="note">{t.estimateNote}</span>

                <div className="total">
                  <p className="label">{t.estimatedCost}</p>
                  <h3 className="price">{formatCurrency(breakdown.oneTimeCost)}</h3>
                  <span className="qualifier">{t.exVat}</span>
                </div>

                <div className="total">
                  <p className="label">{t.estimatedWaitTime}</p>
                  <p className="weeks">~{breakdown.weeks} {t.weeks}</p>
                </div>

                {breakdown.monthlyCost > 0 && (
                  <div className="total">
                    <p className="label">{t.monthlyLabel}</p>
                    <h3 className="price">
                      {formatCurrency(breakdown.monthlyCost)}
                      <span className="qualifier">{t.perMonth}</span>
                    </h3>
                  </div>
                )}

                <div className="breakdown">
                  <button className="breakdown-head" onClick={() => setShowBreakdown(!showBreakdown)}>
                    <span>{t.costBreakdown}</span> {showBreakdown ? <FiChevronUp/> : <FiChevronDown/>}
                  </button>
                  {showBreakdown && (
                    <div className="breakdown-list">
                      {breakdown.items.map((it, i) => (
                        <div key={i} className="breakdown-item">
                          <span>{it.name}</span><span className="b-val">{formatCurrency(it.cost)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="vat">
                  <label className="label">{t.selectCountry}</label>
                  <select className="country" value={country} onChange={(e) => setCountry(e.target.value)}>
                    <option value="NO">Norge (25% MVA)</option>
                    <option value="SE">Sverige (25% moms)</option>
                    <option value="DK">Danmark (25% moms)</option>
                    <option value="FI">Finland (24% ALV)</option>
                    <option value="DE">Tyskland (19% MwSt)</option>
                    <option value="FR">Frankrike (20% TVA)</option>
                    <option value="UK">Storbritannia (20% VAT)</option>
                    <option value="US">USA (0% tax)</option>
                  </select>

                  <div className="tax-sum">
                    <div className="tax-row"><span>{t.priceBeforeVat}</span><span>{formatCurrency(breakdown.oneTimeCost)}</span></div>
                    <div className="tax-row"><span>{t.vat} ({breakdown.vatRate}%):</span><span>{formatCurrency(breakdown.vatAmount)}</span></div>
                    <div className="tax-row total"><span>{t.totalInclVat}</span><span>{formatCurrency(breakdown.totalWithVat)}</span></div>
                  </div>
                </div>

                <button className="cta" onClick={() => alert('Kontakt oss for å starte prosjektet!')}>
                  {t.startProject} <FiArrowRight />
                </button>
                <div className="small-actions">
                  <button className="small" onClick={copyEstimate}><FiCopy /> {t.copy}</button>
                  <button className="small" onClick={resetCalculator}><FiRefreshCw /> {t.reset}</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
