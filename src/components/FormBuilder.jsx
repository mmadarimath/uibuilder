import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react'

const typeOptions = [
    { value: 'text', label: 'Short text' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Phone' },
    { value: 'number', label: 'Number' },
    { value: 'select', label: 'Dropdown (custom options)' },
    { value: 'country', label: 'Country select (predefined list)' },
    { value: 'state', label: 'State / Province select' },
    { value: 'checkboxGroup', label: 'Multiple checkboxes' },
    { value: 'checkbox', label: 'Single checkbox' },
    { value: 'optIn', label: 'Opt-in checkbox' },
]

const defaultCountries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'Australia']
const defaultStateMap = {
    'United States': ['California', 'New York', 'Texas', 'Florida'],
    Canada: ['Ontario', 'Quebec', 'British Columbia'],
    'United Kingdom': ['England', 'Scotland', 'Wales'],
}

const FormBuilder = ({ fields, onChange }) => {
    const [openFields, setOpenFields] = useState(new Set())
    const parseLines = (text = '') => text.split(/\n/).map((l) => l.trim()).filter(Boolean)

    const toggleField = (id) => {
        setOpenFields(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const addField = (type = 'text') => {
        const newField = {
            id: crypto.randomUUID(),
            type,
            label: type === 'optIn' ? 'I agree to receive updates' : type === 'checkboxGroup' ? 'Select all that apply' : 'Field label',
            name: type === 'optIn' ? 'optin' : 'field',
            placeholder: 'Enter value',
            required: false,
            showLabel: true,
            options: type === 'select' ? ['Option 1', 'Option 2', 'Option 3'] : type === 'country' ? defaultCountries : type === 'checkboxGroup' ? ['Option A', 'Option B', 'Option C'] : [],
            stateMap: type === 'state' ? defaultStateMap : {},
            dependsOn: type === 'state' ? '' : undefined,
        }
        onChange([...fields, newField])
    }

    const updateField = (id, patch) => {
        onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)))
    }

    const removeField = (id) => {
        onChange(fields.filter((f) => f.id !== id))
    }

    const moveField = (id, direction) => {
        const index = fields.findIndex((f) => f.id === id)
        if (index === -1) return
        const target = index + direction
        if (target < 0 || target >= fields.length) return
        const clone = [...fields]
        const [item] = clone.splice(index, 1)
        clone.splice(target, 0, item)
        onChange(clone)
    }

    const optionTypes = useMemo(() => new Set(['select', 'country', 'checkboxGroup']), [])

    return (
        <div className="space-y-3">
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                {typeOptions.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        className="px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => addField(opt.value)}
                    >
                        <Plus className="h-3 w-3 inline mr-0.5 sm:mr-1" /> <span className="hidden xs:inline">{opt.label}</span><span className="xs:hidden">{opt.label.split(' ')[0]}</span>
                    </button>
                ))}
            </div>

            {fields.map((field, idx) => {
                const isOpen = openFields.has(field.id)
                return (
                    <div key={field.id} className={`rounded-lg border overflow-hidden transition-colors ${isOpen ? 'border-primary/50 bg-primary/5' : 'bg-card'}`}>
                        <div className={`flex justify-between items-center p-3 sm:p-4 transition-colors ${isOpen ? 'bg-primary/10' : 'hover:bg-accent/50'}`}>
                            <button
                                type="button"
                                className="flex items-center gap-2 flex-1 text-left"
                                onClick={() => toggleField(field.id)}
                            >
                                {isOpen ? <ChevronDown className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                <span className={`font-medium text-xs sm:text-sm ${isOpen ? 'text-primary' : ''}`}>Field {idx + 1}</span>
                                {!isOpen && field.label && <span className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]">— {field.label}</span>}
                            </button>
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    className="p-1 sm:p-1.5 rounded-md border border-input hover:bg-accent transition-colors"
                                    onClick={() => moveField(field.id, -1)}
                                >
                                    <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </button>
                                <button
                                    type="button"
                                    className="p-1 sm:p-1.5 rounded-md border border-input hover:bg-accent transition-colors"
                                    onClick={() => moveField(field.id, 1)}
                                >
                                    <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </button>
                                <button
                                    type="button"
                                    className="p-1 sm:p-1.5 rounded-md border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
                                    onClick={() => removeField(field.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </button>
                            </div>
                        </div>
                        {isOpen && (
                            <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-primary/20">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                                    <div>
                                        <label className="text-xs sm:text-sm font-medium mb-1 block">Type</label>
                                        <select
                                            className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                            value={field.type}
                                            onChange={(e) => updateField(field.id, { type: e.target.value })}
                                        >
                                            {typeOptions.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs sm:text-sm font-medium mb-1 block">Label</label>
                                        {field.type === 'optIn' ? (
                                            <textarea
                                                className="flex min-h-[60px] sm:min-h-[80px] w-full rounded-md border border-input bg-background px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                rows={3}
                                                value={field.label}
                                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                placeholder="Enter opt-in text..."
                                            />
                                        ) : (
                                            <input
                                                className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                value={field.label}
                                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs sm:text-sm font-medium mb-1 block">Name attribute</label>
                                        <input
                                            className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                            defaultValue={field.name || ''}
                                            key={`${field.id}-name`}
                                            onBlur={(e) => updateField(field.id, { name: e.target.value.trim() })}
                                        />
                                    </div>
                                    {field.type !== 'checkbox' && field.type !== 'optIn' && field.type !== 'checkboxGroup' && (
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium mb-1 block">Placeholder</label>
                                            <input
                                                className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                value={field.placeholder || ''}
                                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-2 sm:mt-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border border-input"
                                        checked={field.showLabel}
                                        onChange={(e) => updateField(field.id, { showLabel: e.target.checked })}
                                        id={`${field.id}-show-label`}
                                    />
                                    <label className="text-xs sm:text-sm" htmlFor={`${field.id}-show-label`}>Show label</label>
                                </div>
                                {optionTypes.has(field.type) && (
                                    <div className="mt-2 sm:mt-3">
                                        <label className="text-xs sm:text-sm font-medium mb-1 block">Options (one per line)</label>
                                        <textarea
                                            className="flex min-h-[60px] sm:min-h-[80px] w-full rounded-md border border-input bg-background px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                            rows={field.type === 'checkboxGroup' ? 6 : 4}
                                            placeholder={field.type === 'country' ? 'Leave blank for default' : 'Option 1\nOption 2\nOption 3'}
                                            defaultValue={(field.options || []).join('\n')}
                                            key={field.id}
                                            onBlur={(e) => {
                                                const lines = e.target.value.split(/\n/).map((l) => l.trim()).filter(Boolean)
                                                const next = lines.length ? lines : field.type === 'country' ? defaultCountries : []
                                                updateField(field.id, { options: next })
                                            }}
                                        />
                                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Enter each option on a new line (blank lines ignored)</p>
                                    </div>
                                )}
                                {field.type === 'state' && (
                                    <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium mb-1 block">Depends on country field</label>
                                            <select
                                                className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                value={field.dependsOn || ''}
                                                onChange={(e) => updateField(field.id, { dependsOn: e.target.value })}
                                            >
                                                <option value="">Select country field</option>
                                                {fields
                                                    .filter((f) => f.id !== field.id && f.type === 'country')
                                                    .map((f) => (
                                                        <option key={f.id} value={f.id}>{f.label || 'Country field'}</option>
                                                    ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium mb-1 block">States mapping</label>
                                            <textarea
                                                className="flex min-h-[80px] sm:min-h-[100px] w-full rounded-md border border-input bg-background px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                rows={4}
                                                placeholder={"United States:California,New York\nCanada:Ontario,Quebec"}
                                                defaultValue={Object.entries(field.stateMap || {})
                                                    .map(([country, states]) => `${country}:${(states || []).join(',')}`)
                                                    .join('\n')}
                                                key={`${field.id}-statemap`}
                                                onBlur={(e) => {
                                                    const lines = e.target.value.split(/\n/)
                                                    const next = {}
                                                    lines.forEach((line) => {
                                                        const [country, list] = line.split(':')
                                                        if (!country || !list) return
                                                        next[country.trim()] = list.split(',').map((s) => s.trim()).filter(Boolean)
                                                    })
                                                    updateField(field.id, { stateMap: next })
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mt-2 sm:mt-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border border-input"
                                        checked={field.required || false}
                                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                        id={`${field.id}-required`}
                                    />
                                    <label className="text-xs sm:text-sm" htmlFor={`${field.id}-required`}>Required</label>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

FormBuilder.propTypes = {
    fields: PropTypes.arrayOf(PropTypes.object).isRequired,
    onChange: PropTypes.func.isRequired,
}

export default FormBuilder
