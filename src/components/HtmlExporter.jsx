import PropTypes from 'prop-types'
import { Download } from 'lucide-react'
import { generateLandingHtml, generateNewsletterHtml } from '../utils/exporters'

const download = (content, filename) => {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

const HtmlExporter = ({ state }) => {
    const handleLanding = () => {
        download(generateLandingHtml(state), 'landing.html')
    }

    const handleNewsletter = () => {
        download(generateNewsletterHtml(state), 'newsletter.html')
    }

    return (
        <div className="flex gap-1.5 sm:gap-2">
            <button
                type="button"
                className="inline-flex items-center gap-1.5 sm:gap-2 h-8 sm:h-10 px-2.5 sm:px-4 text-xs sm:text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                onClick={handleLanding}
            >
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Landing</span><span className="sm:hidden">LP</span>
            </button>
            <button
                type="button"
                className="inline-flex items-center gap-1.5 sm:gap-2 h-8 sm:h-10 px-2.5 sm:px-4 text-xs sm:text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                onClick={handleNewsletter}
            >
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Newsletter</span><span className="sm:hidden">NL</span>
            </button>
        </div>
    )
}

HtmlExporter.propTypes = {
    state: PropTypes.object.isRequired,
}

export default HtmlExporter
