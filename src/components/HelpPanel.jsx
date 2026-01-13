import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

function HelpPanel({ titleKey, steps, tips, defaultCollapsed = false }) {
  const { t } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed)

  return (
    <div className="help-panel">
      <div className="help-panel-header">
        <div className="help-panel-title">
          <i className="fas fa-question-circle"></i>
          <span>{t(titleKey || 'help_title')}</span>
        </div>
        <button
          className="help-panel-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? t('help_close') : t('help_title')}
        >
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
        </button>
      </div>

      <div className={`help-panel-content ${!isExpanded ? 'collapsed' : ''}`}>
        {steps && steps.map((step, index) => (
          <div key={index} className="help-step">
            <div className="help-step-number">{index + 1}</div>
            <div className="help-step-content">
              <h4>{t(step.titleKey) || step.title}</h4>
              <p>{t(step.descKey) || step.description}</p>
            </div>
          </div>
        ))}

        {tips && tips.length > 0 && (
          <div className="help-tips">
            {tips.map((tip, index) => (
              <div key={index} className="help-tip">
                <i className="fas fa-lightbulb"></i>
                <span>{t(tip.key) || tip.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HelpPanel
