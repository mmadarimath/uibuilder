import PropTypes from 'prop-types'
import { formatHex } from '../utils/color'

const ColorPicker = ({ label, value, onChange }) => {
    const handleChange = (e) => {
        const next = formatHex(e.target.value)
        onChange(next)
    }

    return (
        <div className="mb-2 sm:mb-3">
            <label className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 mb-1">
                <span>{label}</span>
                <span className="text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">HEX</span>
            </label>
            <div className="flex">
                <input
                    type="color"
                    className="w-9 sm:w-12 h-9 sm:h-10 rounded-l-md border border-r-0 border-input cursor-pointer"
                    value={value || '#ffffff'}
                    onChange={(e) => onChange(formatHex(e.target.value))}
                    title="Pick a color"
                />
                <span className="flex items-center px-1.5 sm:px-2 border-y border-input bg-secondary text-secondary-foreground text-xs sm:text-sm">#</span>
                <input
                    className="flex-1 h-9 sm:h-10 px-2 sm:px-3 rounded-r-md border border-input bg-background text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={(value || '').replace('#', '')}
                    maxLength={6}
                    onChange={handleChange}
                    placeholder="RRGGBB"
                />
            </div>
        </div>
    )
}

ColorPicker.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
}

export default ColorPicker
