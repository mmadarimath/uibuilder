import PropTypes from 'prop-types'

const SectionStepper = ({ steps, activeStep, onSelect, maxAllowedStep }) => (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        {steps.map((step) => (
            <button
                key={step.id}
                type="button"
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${activeStep === step.id
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={maxAllowedStep && step.id > maxAllowedStep}
                onClick={() => onSelect(step.id)}
            >
                <span className="hidden sm:inline">{step.id}. {step.label}</span>
                <span className="sm:hidden">{step.id}</span>
            </button>
        ))}
    </div>
)

SectionStepper.propTypes = {
    steps: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number.isRequired, label: PropTypes.string.isRequired })).isRequired,
    activeStep: PropTypes.number.isRequired,
    onSelect: PropTypes.func.isRequired,
    maxAllowedStep: PropTypes.number,
}

export default SectionStepper
