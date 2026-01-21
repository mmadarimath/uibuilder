import PropTypes from 'prop-types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { RotateCcw, Download, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import './App.css'
import ColorPicker from './components/ColorPicker'
import FormBuilder from './components/FormBuilder'
import ImageUploader from './components/ImageUploader'
import SectionStepper from './components/SectionStepper'
import HtmlExporter from './components/HtmlExporter'
import LandingPageRenderer from './components/LandingPageRenderer'
import NewsletterRenderer from './components/NewsletterRenderer'
import { handlePaste } from './utils/paste'
import { clearState, loadState, saveState } from './utils/storage'

const createDefaultState = () => ({
  layout: { fluid: false },
  navbar: {
    logo: '',
    secondaryLogo: '',
    bgColor: '#ffffff',
    align: 'start',
    link: '',
  },
  hero: {
    type: 'color',
    bgColor: '#ffffff',
    bgImage: '',
    title: 'Build fast. Launch faster.',
    subtitle: '',
    showSubtitle: false,
    titleColor: '#000000',
    align: 'start',
    paddingY: 72,
    showButton: false,
  },
  heroButton: { text: 'Download now', bgColor: '#000000', textColor: '#ffffff', width: 'md', align: 'start' },
  content: {
    thumbnail: '',
    thumbPosition: 'above',
    abstract: '<p>Describe your offer and value.</p>',
    align: 'start',
    paddingY: 48,
  },
  form: {
    title: 'Join the waitlist',
    titleAlign: 'start',
    panelBgType: 'color',
    panelBgColor: '#ffffff',
    panelBgImage: '',
    panelTextColor: '#000000',
    panelPadding: 24,
    panelMargin: 0,
    stackInputs: true,
    customQuestions: [],
    fields: [
      { id: 'firstName', name: 'firstname', type: 'text', label: 'First Name', showLabel: false, placeholder: 'First Name', required: false },
      { id: 'lastName', name: 'lastname', type: 'text', label: 'Last Name', showLabel: false, placeholder: 'Last Name', required: false },
      { id: 'email', name: 'email', type: 'email', label: 'Email', showLabel: false, placeholder: 'Email', required: false },
      { id: 'company', name: 'companyname', type: 'text', label: 'Company Name', showLabel: false, placeholder: 'Company Name', required: false },
      { id: 'jobTitle', name: 'jobtitle', type: 'text', label: 'Job Title', showLabel: false, placeholder: 'Job Title', required: false },
      { id: 'phone', name: 'phonenumber', type: 'tel', label: 'Phone Number', showLabel: false, placeholder: 'Phone Number', required: false },
      { id: 'optin', name: 'optin', type: 'optIn', label: 'I agree to receive updates and accept the Privacy Policy and Terms of Service', showLabel: true, required: false },
    ],
    button: { text: 'Submit', name: 'submit', value: 'Download Now', bgColor: '#000000', textColor: '#ffffff', width: 'md', align: 'start' },
  },
  footer: {
    bgColor: '#000000',
    textColor: '#ffffff',
    text: 'Add your footer/branding.',
    leftText: 'Brand',
    rightText: 'All rights reserved',
    align: 'center',
    paddingY: 32,
  },
  newsletter: {
    navbar: { logo: '', secondaryLogo: '', bgColor: '#000000', align: 'start' },
    hero: {
      type: 'color',
      bgColor: '#000000',
      bgImage: '',
      title: 'Newsletter Title',
      titleColor: '#ffffff',
      subtitle: '',
      showSubtitle: false,
      showButton: false,
      showImage: false,
      heroImage: '',
      align: 'center',
      paddingY: 48,
    },
    heroButton: { text: 'Learn More', bgColor: '#ffffff', textColor: '#000000', width: 'md' },
    thumbnail: { image: '', mode: 'full' },
    abstract: '<p>Welcome to the newsletter. Drop your intro and key points.</p>',
    abstractAlign: 'start',
    abstractPaddingY: 24,
    button: { text: 'Call to Action', bgColor: '#000000', textColor: '#ffffff', width: 'md' },
    divider: { color: '#e5e5e5', thickness: 1 },
    footer: { bgColor: '#000000', textColor: '#ffffff', text: 'Company Name\n123 Street Address, City, State 12345\n\nYou received this email because you subscribed to our newsletter.\nUnsubscribe | Privacy Policy | Contact Us', align: 'center', paddingY: 20 },
  },
})

const landingSteps = [
  { id: 1, label: 'Layout' },
  { id: 2, label: 'Navbar' },
  { id: 3, label: 'Hero' },
  { id: 4, label: 'Content' },
  { id: 5, label: 'Form' },
  { id: 6, label: 'Footer' },
]

const newsletterSteps = [
  { id: 1, label: 'Navbar' },
  { id: 2, label: 'Hero' },
  { id: 3, label: 'Thumbnail' },
  { id: 4, label: 'Abstract' },
  { id: 5, label: 'Button' },
  { id: 6, label: 'Divider' },
  { id: 7, label: 'Footer' },
]

const mergeDeep = (target, source) => {
  const output = { ...target }
  if (!source) return output
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key]
    const targetValue = target[key]
    if (Array.isArray(sourceValue)) {
      output[key] = sourceValue
    } else if (sourceValue && typeof sourceValue === 'object') {
      output[key] = mergeDeep(targetValue || {}, sourceValue)
    } else {
      output[key] = sourceValue
    }
  })
  return output
}

const buildInitialState = () => mergeDeep(createDefaultState(), loadState())

// UI Components
const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  }
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
}

const Card = ({ children, className = '' }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
)

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}

const Input = ({ className = '', ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)

Input.propTypes = {
  className: PropTypes.string,
}

const Label = ({ children, className = '', ...props }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
    {children}
  </label>
)

Label.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}

const Select = ({ children, className = '', ...props }) => (
  <select
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </select>
)

Select.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}

const Checkbox = ({ checked, onChange, id, className = '' }) => (
  <input
    type="checkbox"
    id={id}
    checked={checked}
    onChange={onChange}
    className={`h-4 w-4 rounded border border-input bg-background text-primary focus:ring-2 focus:ring-ring cursor-pointer ${className}`}
  />
)

Checkbox.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  id: PropTypes.string,
  className: PropTypes.string,
}

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className={`rounded-md border overflow-hidden transition-colors ${isOpen ? 'border-primary/50 bg-primary/5' : 'bg-secondary/30'}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 sm:p-4 text-left transition-colors ${isOpen ? 'bg-primary/10 hover:bg-primary/15' : 'hover:bg-secondary/50'}`}
      >
        <h6 className={`font-medium text-sm ${isOpen ? 'text-primary' : ''}`}>{title}</h6>
        {isOpen ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {isOpen && <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-primary/20">{children}</div>}
    </div>
  )
}

Accordion.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  defaultOpen: PropTypes.bool,
}

const BuilderToggle = ({ builder, onChange }) => (
  <div className="inline-flex rounded-md border border-input bg-background p-0.5 sm:p-1">
    <button
      type="button"
      onClick={() => onChange('landing')}
      className={`px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded transition-colors ${builder === 'landing' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
    >
      <span className="hidden sm:inline">Landing Page</span>
      <span className="sm:hidden">Landing</span>
    </button>
    <button
      type="button"
      onClick={() => onChange('newsletter')}
      className={`px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded transition-colors ${builder === 'newsletter' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
    >
      <span className="hidden sm:inline">Newsletter</span>
      <span className="sm:hidden">News</span>
    </button>
  </div>
)

BuilderToggle.propTypes = {
  builder: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

const CustomQuestionsEditor = ({ questions, onChange }) => {
  const handleAdd = () => {
    onChange([
      ...questions,
      { id: crypto.randomUUID(), label: 'Custom question', type: 'select', optionsText: 'Option 1\nOption 2' },
    ])
  }

  const handleUpdate = (id, patch) => {
    onChange(questions.map((q) => (q.id === id ? { ...q, ...patch } : q)))
  }

  const handleRemove = (id) => {
    onChange(questions.filter((q) => q.id !== id))
  }

  return (
    <div className="space-y-3">
      {questions.map((q, idx) => (
        <div key={q.id} className="rounded-md border bg-secondary/30 p-3 sm:p-4">
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <span className="font-medium text-sm">Question {idx + 1}</span>
            <Button variant="destructive" size="sm" onClick={() => handleRemove(q.id)} className="h-8 px-2">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <div>
              <Label className="text-xs sm:text-sm">Label</Label>
              <Input value={q.label} onChange={(e) => handleUpdate(q.id, { label: e.target.value })} className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Field type</Label>
              <Select value={q.type} onChange={(e) => handleUpdate(q.id, { type: e.target.value })} className="mt-1 h-9 text-sm">
                <option value="select">Dropdown</option>
                <option value="country">Country select</option>
                <option value="checkboxGroup">Multiple checkboxes</option>
              </Select>
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <Label className="text-xs sm:text-sm">Options (one per line)</Label>
            <textarea
              className="mt-1 flex min-h-[60px] sm:min-h-[80px] w-full rounded-md border border-input bg-background px-2 sm:px-3 py-2 text-xs sm:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={q.type === 'country' ? 'Leave blank for default' : 'Option 1\nOption 2'}
              value={q.optionsText || ''}
              onChange={(e) => handleUpdate(q.id, { optionsText: e.target.value })}
            />
          </div>
        </div>
      ))}
      <Button onClick={handleAdd} className="w-full h-9 text-sm">
        <Plus className="h-4 w-4" /> Add custom question
      </Button>
    </div>
  )
}

CustomQuestionsEditor.propTypes = {
  questions: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func.isRequired,
}

const OptInEditor = ({ form, onChange }) => {
  const optInIndex = form.fields.findIndex((f) => f.type === 'optIn')
  const optInField = optInIndex >= 0 ? form.fields[optInIndex] : null
  const includeOptIn = optInIndex >= 0

  const toggleOptIn = (checked) => {
    if (checked && !optInField) {
      onChange([...form.fields, { id: crypto.randomUUID(), type: 'optIn', label: 'I agree to receive updates', name: 'optin', showLabel: true, required: false }])
    }
    if (!checked && optInField) {
      onChange(form.fields.filter((f) => f.type !== 'optIn'))
    }
  }

  const updateLabel = (label) => {
    if (!optInField) return
    onChange(form.fields.map((f) => (f.type === 'optIn' ? { ...f, label } : f)))
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox id="includeOptIn" checked={includeOptIn} onChange={(e) => toggleOptIn(e.target.checked)} />
        <Label htmlFor="includeOptIn" className="text-xs sm:text-sm">Include privacy/opt-in checkbox</Label>
      </div>
      {includeOptIn && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div className="sm:col-span-1">
            <Label className="text-xs sm:text-sm">Opt-in label</Label>
            <Input value={optInField?.label || ''} onChange={(e) => updateLabel(e.target.value)} className="mt-1 h-9 text-sm" />
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Auto-links "privacy policy" and "terms"</p>
          </div>
          <div>
            <Label className="text-xs sm:text-sm">Required</Label>
            <Select
              value={optInField?.required ? 'yes' : 'no'}
              onChange={(e) => {
                const required = e.target.value === 'yes'
                onChange(form.fields.map((f) => (f.type === 'optIn' ? { ...f, required } : f)))
              }}
              className="mt-1 h-9 text-sm"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}

OptInEditor.propTypes = {
  form: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
}

const ContentEditor = ({ content, abstractRef, onUpdate, onPaste }) => (
  <Card className="p-3 sm:p-5">
    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">Content</h5>
    <div className="space-y-3 sm:space-y-4">
      <ImageUploader label="Thumbnail" value={content.thumbnail} onChange={(val) => onUpdate(['content', 'thumbnail'], val)} />
      <div>
        <Label className="text-xs sm:text-sm">Thumbnail position</Label>
        <div className="flex flex-wrap gap-3 sm:gap-4 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={content.thumbPosition === 'above'}
              onChange={() => onUpdate(['content', 'thumbPosition'], 'above')}
              className="h-4 w-4"
            />
            <span className="text-xs sm:text-sm">Above abstract</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={content.thumbPosition === 'below'}
              onChange={() => onUpdate(['content', 'thumbPosition'], 'below')}
              className="h-4 w-4"
            />
            <span className="text-xs sm:text-sm">Below abstract</span>
          </label>
        </div>
      </div>
      <div>
        <Label className="text-xs sm:text-sm">Abstract (paste rich text)</Label>
        <div
          className="mt-1 min-h-[100px] sm:min-h-[120px] w-full rounded-md border border-input bg-background px-2 sm:px-3 py-2 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-text"
          contentEditable
          ref={abstractRef}
          suppressContentEditableWarning
          onInput={(e) => onUpdate(['content', 'abstract'], e.currentTarget.innerHTML)}
          onPaste={onPaste}
          dangerouslySetInnerHTML={{ __html: content.abstract }}
        />
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Supports headings, paragraphs, lists, bold/italic</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <div>
          <Label className="text-xs sm:text-sm">Section alignment</Label>
          <Select value={content.align} onChange={(e) => onUpdate(['content', 'align'], e.target.value)} className="mt-1 h-9 text-sm">
            <option value="start">Left</option>
            <option value="center">Center</option>
            <option value="end">Right</option>
          </Select>
        </div>
        <div>
          <Label className="text-xs sm:text-sm">Vertical padding (px)</Label>
          <Input
            type="number"
            min={16}
            max={160}
            value={content.paddingY}
            onChange={(e) => onUpdate(['content', 'paddingY'], Number(e.target.value) || 32)}
            className="mt-1 h-9 text-sm"
          />
        </div>
      </div>
    </div>
  </Card>
)

ContentEditor.propTypes = {
  content: PropTypes.object.isRequired,
  abstractRef: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onPaste: PropTypes.func.isRequired,
}

const FormEditor = ({ form, onUpdate }) => (
  <Card className="p-3 sm:p-5">
    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">Form</h5>
    <div className="space-y-2 sm:space-y-3">
      {/* Form Styling */}
      <Accordion title="Form styling" defaultOpen={true}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div>
            <Label className="text-xs sm:text-sm">Form title</Label>
            <Input value={form.title} onChange={(e) => onUpdate(['form', 'title'], e.target.value)} className="mt-1 h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs sm:text-sm">Title alignment</Label>
            <Select value={form.titleAlign} onChange={(e) => onUpdate(['form', 'titleAlign'], e.target.value)} className="mt-1 h-9 text-sm">
              <option value="start">Left</option>
              <option value="center">Center</option>
              <option value="end">Right</option>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-2 sm:mt-3">
          <div>
            <Label className="text-xs sm:text-sm">Background type</Label>
            <Select value={form.panelBgType} onChange={(e) => onUpdate(['form', 'panelBgType'], e.target.value)} className="mt-1 h-9 text-sm">
              <option value="color">Color</option>
              <option value="image">Image</option>
            </Select>
          </div>
          {form.panelBgType === 'color' ? (
            <div>
              <ColorPicker label="Container color" value={form.panelBgColor} onChange={(val) => onUpdate(['form', 'panelBgColor'], val)} />
            </div>
          ) : (
            <div>
              <ImageUploader label="Background image" value={form.panelBgImage} onChange={(val) => onUpdate(['form', 'panelBgImage'], val)} />
            </div>
          )}
          <div>
            <ColorPicker label="Text color" value={form.panelTextColor || ''} onChange={(val) => onUpdate(['form', 'panelTextColor'], val)} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-2 sm:mt-3">
          <div>
            <Label className="text-xs sm:text-sm">Form padding (px)</Label>
            <Input type="number" min={12} max={120} value={form.panelPadding} onChange={(e) => onUpdate(['form', 'panelPadding'], Number(e.target.value) || 24)} className="mt-1 h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs sm:text-sm">Vertical margin (px)</Label>
            <Input type="number" min={-120} max={160} value={form.panelMargin} onChange={(e) => onUpdate(['form', 'panelMargin'], Number(e.target.value) || 0)} className="mt-1 h-9 text-sm" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-3">
          <Checkbox id="stackInputs" checked={form.stackInputs !== false} onChange={(e) => onUpdate(['form', 'stackInputs'], e.target.checked)} />
          <Label htmlFor="stackInputs" className="text-xs sm:text-sm">Stack input fields side-by-side</Label>
        </div>
      </Accordion>

      {/* Form Fields */}
      <Accordion title="Form fields">
        <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">Add, remove, or edit fields. Toggle "Show label" to display labels.</p>
        <FormBuilder fields={form.fields} onChange={(fields) => onUpdate(['form', 'fields'], fields)} />
      </Accordion>

      {/* Custom Questions */}
      <Accordion title="Custom questions">
        <CustomQuestionsEditor questions={form.customQuestions || []} onChange={(qs) => onUpdate(['form', 'customQuestions'], qs)} />
      </Accordion>

      {/* Privacy & Opt-in */}
      <Accordion title="Privacy & opt-in">
        <OptInEditor form={form} onChange={(fields) => onUpdate(['form', 'fields'], fields)} />
      </Accordion>

      {/* Form Button */}
      <Accordion title="Form button">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div>
            <Label className="text-xs sm:text-sm">Button text</Label>
            <Input value={form.button.text} onChange={(e) => onUpdate(['form', 'button', 'text'], e.target.value)} className="mt-1 h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs sm:text-sm">Button width</Label>
            <Select value={form.button.width} onChange={(e) => onUpdate(['form', 'button', 'width'], e.target.value)} className="mt-1 h-9 text-sm">
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-2 sm:mt-3">
          <ColorPicker label="Button background" value={form.button.bgColor} onChange={(val) => onUpdate(['form', 'button', 'bgColor'], val)} />
          <ColorPicker label="Button text color" value={form.button.textColor} onChange={(val) => onUpdate(['form', 'button', 'textColor'], val)} />
        </div>
        <div className="mt-2 sm:mt-3">
          <Label className="text-xs sm:text-sm">Button alignment</Label>
          <Select value={form.button.align} onChange={(e) => onUpdate(['form', 'button', 'align'], e.target.value)} className="mt-1 h-9 text-sm">
            <option value="start">Left</option>
            <option value="center">Center</option>
            <option value="end">Right</option>
          </Select>
        </div>
        <Accordion title="PHP attributes (optional)" className="mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <div>
              <Label className="text-xs sm:text-sm">Name attribute</Label>
              <Input value={form.button.name || ''} onChange={(e) => onUpdate(['form', 'button', 'name'], e.target.value)} placeholder="submit" className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Value attribute</Label>
              <Input value={form.button.value || ''} onChange={(e) => onUpdate(['form', 'button', 'value'], e.target.value)} placeholder="Download Now" className="mt-1 h-9 text-sm" />
            </div>
          </div>
        </Accordion>
      </Accordion>
    </div>
  </Card>
)

FormEditor.propTypes = {
  form: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
}

function App() {
  const [builder, setBuilder] = useState('landing')
  const [state, setState] = useState(() => buildInitialState())
  const [steps, setSteps] = useState({ landing: 1, newsletter: 1 })
  const [unlocked, setUnlocked] = useState({ landing: 1, newsletter: 1 })

  const abstractRef = useRef(null)
  const newsAbstractRef = useRef(null)

  useEffect(() => {
    saveState(state)
  }, [state])

  const updateState = (path, value) => {
    setState((prev) => {
      const next = JSON.parse(JSON.stringify(prev))
      let cursor = next
      for (let i = 0; i < path.length - 1; i += 1) {
        cursor = cursor[path[i]]
      }
      cursor[path[path.length - 1]] = value
      return next
    })
  }

  const reset = () => {
    clearState()
    setState(createDefaultState())
    setSteps({ landing: 1, newsletter: 1 })
    setUnlocked({ landing: 1, newsletter: 1 })
  }

  const currentStep = builder === 'landing' ? steps.landing : steps.newsletter
  const setStep = (value) => {
    const maxAllowed = unlocked[builder] + 1
    const nextValue = value > maxAllowed ? maxAllowed : value
    setSteps((prev) => ({ ...prev, [builder]: nextValue }))
    setUnlocked((prev) => ({ ...prev, [builder]: Math.max(prev[builder], nextValue) }))
  }

  const handleAbstractPaste = (event) => {
    handlePaste(event, (clean) => {
      if (abstractRef.current) {
        abstractRef.current.innerHTML = clean
      }
      updateState(['content', 'abstract'], clean)
    })
  }

  const handleNewsAbstractPaste = (event) => {
    handlePaste(event, (clean) => {
      if (newsAbstractRef.current) {
        newsAbstractRef.current.innerHTML = clean
      }
      updateState(['newsletter', 'abstract'], clean)
    })
  }

  const landingEditor = useMemo(() => {
    const { layout, navbar, hero, heroButton, content, form, footer } = state
    switch (currentStep) {
      case 1:
        return (
          <Card className="p-3 sm:p-5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">Layout</h5>
            <div className="flex items-center gap-2 sm:gap-3">
              <Checkbox id="fluidToggle" checked={layout.fluid} onChange={(e) => updateState(['layout', 'fluid'], e.target.checked)} />
              <Label htmlFor="fluidToggle" className="text-xs sm:text-sm">Use full-width container</Label>
            </div>
          </Card>
        )
      case 2:
        return (
          <Card className="p-3 sm:p-5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">Navbar</h5>
            <div className="space-y-3 sm:space-y-4">
              <ColorPicker label="Background color" value={navbar.bgColor} onChange={(val) => updateState(['navbar', 'bgColor'], val)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <ImageUploader label="Primary logo" value={navbar.logo} onChange={(val) => updateState(['navbar', 'logo'], val)} />
                <ImageUploader label="Secondary logo" value={navbar.secondaryLogo} onChange={(val) => updateState(['navbar', 'secondaryLogo'], val)} />
              </div>
              <div>
                <Label className="text-xs sm:text-sm">Logo link URL</Label>
                <Input value={navbar.link || ''} onChange={(e) => updateState(['navbar', 'link'], e.target.value)} placeholder="https://example.com" className="mt-1 h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs sm:text-sm">Logo alignment</Label>
                <Select value={navbar.align} onChange={(e) => updateState(['navbar', 'align'], e.target.value)} className="mt-1 h-9 text-sm">
                  <option value="start">Left</option>
                  <option value="center">Center</option>
                  <option value="end">Right</option>
                </Select>
              </div>
            </div>
          </Card>
        )
      case 3:
        return (
          <Card className="p-3 sm:p-5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">Hero</h5>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label className="text-xs sm:text-sm">Background type</Label>
                <Select value={hero.type} onChange={(e) => updateState(['hero', 'type'], e.target.value)} className="mt-1 h-9 text-sm">
                  <option value="color">Color</option>
                  <option value="image">Image</option>
                </Select>
              </div>
              {hero.type === 'color' ? (
                <ColorPicker label="Background color" value={hero.bgColor} onChange={(val) => updateState(['hero', 'bgColor'], val)} />
              ) : (
                <ImageUploader label="Hero background image" value={hero.bgImage} onChange={(val) => updateState(['hero', 'bgImage'], val)} />
              )}
              <div>
                <Label className="text-xs sm:text-sm">Title</Label>
                <Input value={hero.title} onChange={(e) => updateState(['hero', 'title'], e.target.value)} className="mt-1 h-9 text-sm" />
              </div>

              {/* Optional Subtitle */}
              <div className="rounded-md border bg-secondary/30 p-2 sm:p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox id="showSubtitle" checked={hero.showSubtitle} onChange={(e) => updateState(['hero', 'showSubtitle'], e.target.checked)} />
                  <Label htmlFor="showSubtitle" className="text-xs sm:text-sm">Show subtitle</Label>
                </div>
                {hero.showSubtitle && (
                  <Input value={hero.subtitle || ''} onChange={(e) => updateState(['hero', 'subtitle'], e.target.value)} placeholder="Enter subtitle..." className="mt-2 h-9 text-sm" />
                )}
              </div>

              <ColorPicker label="Title color" value={hero.titleColor} onChange={(val) => updateState(['hero', 'titleColor'], val)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <Label className="text-xs sm:text-sm">Text alignment</Label>
                  <Select value={hero.align} onChange={(e) => updateState(['hero', 'align'], e.target.value)} className="mt-1 h-9 text-sm">
                    <option value="start">Left</option>
                    <option value="center">Center</option>
                    <option value="end">Right</option>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">Vertical padding (px)</Label>
                  <Input type="number" min={24} max={160} value={hero.paddingY} onChange={(e) => updateState(['hero', 'paddingY'], Number(e.target.value) || 48)} className="mt-1 h-9 text-sm" />
                </div>
              </div>

              {/* Optional Hero Button */}
              <div className="rounded-md border bg-secondary/30 p-2 sm:p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox id="showHeroBtn" checked={hero.showButton} onChange={(e) => updateState(['hero', 'showButton'], e.target.checked)} />
                  <Label htmlFor="showHeroBtn" className="text-xs sm:text-sm">Show hero button</Label>
                </div>
                {hero.showButton && (
                  <div className="space-y-2 sm:space-y-3 mt-2 sm:mt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <Label>Button text</Label>
                        <Input value={heroButton.text} onChange={(e) => updateState(['heroButton', 'text'], e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label>Button width</Label>
                        <Select value={heroButton.width} onChange={(e) => updateState(['heroButton', 'width'], e.target.value)} className="mt-1">
                          <option value="sm">Small</option>
                          <option value="md">Medium</option>
                          <option value="lg">Large</option>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <ColorPicker label="Button background" value={heroButton.bgColor} onChange={(val) => updateState(['heroButton', 'bgColor'], val)} />
                      <ColorPicker label="Button text color" value={heroButton.textColor} onChange={(val) => updateState(['heroButton', 'textColor'], val)} />
                    </div>
                    <div>
                      <Label>Button alignment</Label>
                      <Select value={heroButton.align} onChange={(e) => updateState(['heroButton', 'align'], e.target.value)} className="mt-1">
                        <option value="start">Left</option>
                        <option value="center">Center</option>
                        <option value="end">Right</option>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )
      case 4:
        return <ContentEditor content={content} abstractRef={abstractRef} onPaste={handleAbstractPaste} onUpdate={updateState} />
      case 5:
        return <FormEditor form={form} onUpdate={updateState} />
      case 6:
      default:
        return (
          <Card className="p-3 sm:p-5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">Footer</h5>
            <div className="space-y-3 sm:space-y-4">
              <ColorPicker label="Background" value={footer.bgColor} onChange={(val) => updateState(['footer', 'bgColor'], val)} />
              <ColorPicker label="Text color" value={footer.textColor} onChange={(val) => updateState(['footer', 'textColor'], val)} />
              <div>
                <Label className="text-xs sm:text-sm">Left footer text</Label>
                <Input value={footer.leftText || ''} onChange={(e) => updateState(['footer', 'leftText'], e.target.value)} className="mt-1 h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs sm:text-sm">Right footer text</Label>
                <Input value={footer.rightText || ''} onChange={(e) => updateState(['footer', 'rightText'], e.target.value)} className="mt-1 h-9 text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <Label className="text-xs sm:text-sm">Alignment</Label>
                  <Select value={footer.align} onChange={(e) => updateState(['footer', 'align'], e.target.value)} className="mt-1 h-9 text-sm">
                    <option value="start">Left</option>
                    <option value="center">Center</option>
                    <option value="end">Right</option>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">Vertical padding (px)</Label>
                  <Input type="number" min={12} max={120} value={footer.paddingY} onChange={(e) => updateState(['footer', 'paddingY'], Number(e.target.value) || 24)} className="mt-1 h-9 text-sm" />
                </div>
              </div>
            </div>
          </Card>
        )
    }
  }, [currentStep, state])

  const newsletterEditor = useMemo(() => {
    const { newsletter: ns } = state
    switch (currentStep) {
      case 1:
        return (
          <Card className="p-3 sm:p-5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">Navbar</h5>
            <div className="space-y-3 sm:space-y-4">
              <ColorPicker label="Background" value={ns.navbar.bgColor} onChange={(val) => updateState(['newsletter', 'navbar', 'bgColor'], val)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <ImageUploader label="Primary logo" value={ns.navbar.logo} onChange={(val) => updateState(['newsletter', 'navbar', 'logo'], val)} />
                <ImageUploader label="Secondary logo" value={ns.navbar.secondaryLogo} onChange={(val) => updateState(['newsletter', 'navbar', 'secondaryLogo'], val)} />
              </div>
              <div>
                <Label className="text-xs sm:text-sm">Logo alignment</Label>
                <Select value={ns.navbar.align} onChange={(e) => updateState(['newsletter', 'navbar', 'align'], e.target.value)} className="mt-1 h-9 text-sm">
                  <option value="start">Left</option>
                  <option value="center">Center</option>
                  <option value="end">Right</option>
                </Select>
              </div>
            </div>
          </Card>
        )
      case 2:
        return (
          <Card className="p-3 sm:p-5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">Hero</h5>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label className="text-xs sm:text-sm">Background type</Label>
                <Select value={ns.hero.type} onChange={(e) => updateState(['newsletter', 'hero', 'type'], e.target.value)} className="mt-1 h-9 text-sm">
                  <option value="color">Color</option>
                  <option value="image">Image</option>
                </Select>
              </div>
              {ns.hero.type === 'color' ? (
                <ColorPicker label="Background color" value={ns.hero.bgColor} onChange={(val) => updateState(['newsletter', 'hero', 'bgColor'], val)} />
              ) : (
                <ImageUploader label="Hero background" value={ns.hero.bgImage} onChange={(val) => updateState(['newsletter', 'hero', 'bgImage'], val)} />
              )}
              <div>
                <Label className="text-xs sm:text-sm">Title</Label>
                <Input value={ns.hero.title} onChange={(e) => updateState(['newsletter', 'hero', 'title'], e.target.value)} className="mt-1 h-9 text-sm" />
              </div>
              <ColorPicker label="Title color" value={ns.hero.titleColor} onChange={(val) => updateState(['newsletter', 'hero', 'titleColor'], val)} />

              {/* Optional Subtitle */}
              <div className="rounded-md border bg-secondary/30 p-2 sm:p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox id="newsShowSubtitle" checked={ns.hero.showSubtitle} onChange={(e) => updateState(['newsletter', 'hero', 'showSubtitle'], e.target.checked)} />
                  <Label htmlFor="newsShowSubtitle" className="text-xs sm:text-sm">Show subtitle</Label>
                </div>
                {ns.hero.showSubtitle && (
                  <Input value={ns.hero.subtitle || ''} onChange={(e) => updateState(['newsletter', 'hero', 'subtitle'], e.target.value)} placeholder="Enter subtitle..." className="mt-2 h-9 text-sm" />
                )}
              </div>

              {/* Optional Hero Button */}
              <div className="rounded-md border bg-secondary/30 p-2 sm:p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox id="newsShowHeroBtn" checked={ns.hero.showButton} onChange={(e) => updateState(['newsletter', 'hero', 'showButton'], e.target.checked)} />
                  <Label htmlFor="newsShowHeroBtn" className="text-xs sm:text-sm">Show hero button</Label>
                </div>
                {ns.hero.showButton && (
                  <div className="space-y-2 sm:space-y-3 mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <Label className="text-xs sm:text-sm">Button text</Label>
                        <Input value={ns.heroButton?.text || 'Learn More'} onChange={(e) => updateState(['newsletter', 'heroButton', 'text'], e.target.value)} className="mt-1 h-9 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">Button width</Label>
                        <Select value={ns.heroButton?.width || 'md'} onChange={(e) => updateState(['newsletter', 'heroButton', 'width'], e.target.value)} className="mt-1 h-9 text-sm">
                          <option value="sm">Small</option>
                          <option value="md">Medium</option>
                          <option value="lg">Large</option>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <ColorPicker label="Button background" value={ns.heroButton?.bgColor || '#ffffff'} onChange={(val) => updateState(['newsletter', 'heroButton', 'bgColor'], val)} />
                      <ColorPicker label="Button text color" value={ns.heroButton?.textColor || '#000000'} onChange={(val) => updateState(['newsletter', 'heroButton', 'textColor'], val)} />
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Hero Image (splits layout) */}
              <div className="rounded-md border bg-secondary/30 p-2 sm:p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox id="newsShowHeroImg" checked={ns.hero.showImage} onChange={(e) => updateState(['newsletter', 'hero', 'showImage'], e.target.checked)} />
                  <Label htmlFor="newsShowHeroImg" className="text-xs sm:text-sm">Add hero image (splits layout: text left, image right)</Label>
                </div>
                {ns.hero.showImage && (
                  <ImageUploader label="Hero image" value={ns.hero.heroImage || ''} onChange={(val) => updateState(['newsletter', 'hero', 'heroImage'], val)} />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <Label className="text-xs sm:text-sm">Text alignment</Label>
                  <Select value={ns.hero.align} onChange={(e) => updateState(['newsletter', 'hero', 'align'], e.target.value)} className="mt-1 h-9 text-sm">
                    <option value="start">Left</option>
                    <option value="center">Center</option>
                    <option value="end">Right</option>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">Vertical padding (px)</Label>
                  <Input type="number" min={16} max={140} value={ns.hero.paddingY} onChange={(e) => updateState(['newsletter', 'hero', 'paddingY'], Number(e.target.value) || 32)} className="mt-1 h-9 text-sm" />
                </div>
              </div>
            </div>
          </Card>
        )
      case 3:
        return (
          <Card className="p-3 sm:p-5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">Thumbnail</h5>
            <div className="space-y-3 sm:space-y-4">
              <ImageUploader label="Image" value={ns.thumbnail.image} onChange={(val) => updateState(['newsletter', 'thumbnail', 'image'], val)} />
              <div>
                <Label className="text-xs sm:text-sm">Display mode</Label>
                <Select value={ns.thumbnail.mode} onChange={(e) => updateState(['newsletter', 'thumbnail', 'mode'], e.target.value)} className="mt-1 h-9 text-sm">
                  <option value="full">Full width (650-700px)</option>
                  <option value="small">Small centered (350-400px)</option>
                </Select>
              </div>
            </div>
          </Card>
        )
      case 4:
        return (
          <Card className="p-3 sm:p-5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">Abstract</h5>
            <div className="space-y-3 sm:space-y-4">
              <div
                className="min-h-[100px] sm:min-h-[140px] w-full rounded-md border border-input bg-background px-2 sm:px-3 py-2 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-text"
                contentEditable
                ref={newsAbstractRef}
                suppressContentEditableWarning
                onInput={(e) => updateState(['newsletter', 'abstract'], e.currentTarget.innerHTML)}
                onPaste={handleNewsAbstractPaste}
                dangerouslySetInnerHTML={{ __html: ns.abstract }}
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground">Preserves headings, paragraphs, lists</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <Label className="text-xs sm:text-sm">Text alignment</Label>
                  <Select value={ns.abstractAlign} onChange={(e) => updateState(['newsletter', 'abstractAlign'], e.target.value)} className="mt-1 h-9 text-sm">
                    <option value="start">Left</option>
                    <option value="center">Center</option>
                    <option value="end">Right</option>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">Vertical padding (px)</Label>
                  <Input type="number" min={12} max={140} value={ns.abstractPaddingY} onChange={(e) => updateState(['newsletter', 'abstractPaddingY'], Number(e.target.value) || 24)} className="mt-1 h-9 text-sm" />
                </div>
              </div>
            </div>
          </Card>
        )
      case 5:
        return (
          <Card className="p-3 sm:p-5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">Button</h5>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label className="text-xs sm:text-sm">Text</Label>
                <Input value={ns.button.text} onChange={(e) => updateState(['newsletter', 'button', 'text'], e.target.value)} className="mt-1 h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs sm:text-sm">Button width</Label>
                <Select value={ns.button.width} onChange={(e) => updateState(['newsletter', 'button', 'width'], e.target.value)} className="mt-1 h-9 text-sm">
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </Select>
              </div>
              <ColorPicker label="Background" value={ns.button.bgColor} onChange={(val) => updateState(['newsletter', 'button', 'bgColor'], val)} />
              <ColorPicker label="Text color" value={ns.button.textColor} onChange={(val) => updateState(['newsletter', 'button', 'textColor'], val)} />
            </div>
          </Card>
        )
      case 6:
        return (
          <Card className="p-3 sm:p-5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">Divider</h5>
            <div className="space-y-3 sm:space-y-4">
              <ColorPicker label="Color" value={ns.divider.color} onChange={(val) => updateState(['newsletter', 'divider', 'color'], val)} />
              <div>
                <Label className="text-xs sm:text-sm">Thickness (px)</Label>
                <Input type="number" min={1} max={8} value={ns.divider.thickness} onChange={(e) => updateState(['newsletter', 'divider', 'thickness'], Number(e.target.value) || 1)} className="mt-1 h-9 text-sm" />
              </div>
            </div>
          </Card>
        )
      case 7:
      default:
        return (
          <Card className="p-3 sm:p-5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">Footer</h5>
            <div className="space-y-3 sm:space-y-4">
              <ColorPicker label="Background" value={ns.footer.bgColor} onChange={(val) => updateState(['newsletter', 'footer', 'bgColor'], val)} />
              <ColorPicker label="Text color" value={ns.footer.textColor} onChange={(val) => updateState(['newsletter', 'footer', 'textColor'], val)} />
              <div>
                <Label className="text-xs sm:text-sm">Footer text</Label>
                <textarea
                  className="mt-1 flex min-h-[100px] sm:min-h-[120px] w-full rounded-md border border-input bg-background px-2 sm:px-3 py-2 text-xs sm:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={ns.footer.text}
                  onChange={(e) => updateState(['newsletter', 'footer', 'text'], e.target.value)}
                  placeholder="Company name, address, unsubscribe links..."
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Supports multiple lines for address, legal text, links</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <Label className="text-xs sm:text-sm">Alignment</Label>
                  <Select value={ns.footer.align} onChange={(e) => updateState(['newsletter', 'footer', 'align'], e.target.value)} className="mt-1 h-9 text-sm">
                    <option value="start">Left</option>
                    <option value="center">Center</option>
                    <option value="end">Right</option>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">Vertical padding (px)</Label>
                  <Input type="number" min={12} max={140} value={ns.footer.paddingY} onChange={(e) => updateState(['newsletter', 'footer', 'paddingY'], Number(e.target.value) || 20)} className="mt-1 h-9 text-sm" />
                </div>
              </div>
            </div>
          </Card>
        )
    }
  }, [currentStep, state])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 sm:h-16 items-center justify-between px-2 sm:px-4 gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <h1 className="text-base sm:text-xl font-semibold truncate">UI Builder</h1>
            <BuilderToggle builder={builder} onChange={setBuilder} />
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={reset} className="h-8 sm:h-10 px-2 sm:px-4">
              <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline ml-1">Reset</span>
            </Button>
            <HtmlExporter state={state} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-2 sm:p-4">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 sm:gap-4">
          {/* Editor Panel */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <Card className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold truncate">{builder === 'landing' ? 'Landing Builder' : 'Newsletter Builder'}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Edit sections step-by-step</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground flex-shrink-0">
                  Step {currentStep}
                </span>
              </div>
              <SectionStepper
                steps={builder === 'landing' ? landingSteps : newsletterSteps}
                activeStep={currentStep}
                maxAllowedStep={unlocked[builder] + 1}
                onSelect={setStep}
              />
              <div className="mt-3 sm:mt-4">
                {builder === 'landing' ? landingEditor : newsletterEditor}
              </div>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <Card className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold">Live Preview</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Auto-saved to LocalStorage</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground flex-shrink-0">
                  Color-proofed
                </span>
              </div>
              {builder === 'landing' ? (
                <LandingPageRenderer state={state} />
              ) : (
                <NewsletterRenderer state={state.newsletter} />
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
