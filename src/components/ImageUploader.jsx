import PropTypes from 'prop-types'
import { X } from 'lucide-react'

const ImageUploader = ({ label, value, onChange }) => {
    const handleFile = (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (e) => {
            onChange(e.target?.result || '')
        }
        reader.readAsDataURL(file)
    }

    return (
        <div className="mb-2 sm:mb-3">
            <label className="text-xs sm:text-sm font-medium mb-1 block">{label}</label>
            <div className="flex gap-1.5 sm:gap-2 items-center">
                <input
                    className="flex-1 h-9 sm:h-10 w-full rounded-md border border-input bg-background px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm file:border-0 file:bg-transparent file:text-xs sm:file:text-sm file:font-medium"
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                />
                {value && (
                    <button
                        type="button"
                        className="h-9 sm:h-10 px-2 sm:px-3 text-sm font-medium rounded-md border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => onChange('')}
                    >
                        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                )}
            </div>
            {value && (
                <div className="mt-1.5 sm:mt-2">
                    <img src={value} alt="preview" className="max-h-[60px] sm:max-h-[90px] rounded-lg" />
                </div>
            )}
        </div>
    )
}

ImageUploader.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
}

export default ImageUploader
