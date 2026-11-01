import { lazy, Suspense, useEffect, useState } from 'react'
import { ArrowRight, Check, Github, Languages, Moon, Radar, Sun, X } from 'lucide-react'
import type { Locale, Model, Page } from './types/model'
import { LocaleContext, useLocale } from './hooks/useLocale'
import { useCatalog } from './hooks/useCatalog'
import { readPage, readShare } from './lib/share'
import { safeRead, safeWrite } from './lib/utils'
import { CatalogStatus, Skeleton } from './components/Status'
import { Button } from './components/ui/button'
import { ModelDetails } from './components/ModelDetails'
import Explore from './pages/Explore'
const Calculator = lazy(() => import('./pages/Calculator'))
const Compare = lazy(() => import('./pages/Compare'))
const Insights = lazy(() => import('./pages/Insights'))
const Methodology = lazy(() => import('./pages/Methodology'))
function Workspace({ locale, setLocale }: { locale: Locale; setLocale: (v: Locale) => void }) {
  const { t } = useLocale()
  const [theme, setTheme] = useState(() => safeRead('mvr-theme', 'dark'))
  const [page, setPage] = useState<Page>(() => readPage(location.hash))
  const [initial] = useState(() => readShare(location.search))
  const [selected, setSelected] = useState(initial.models)
  const [workload, setWorkload] = useState(initial.workload)
  const [detail, setDetail] = useState<Model | null>(null)
  const data = useCatalog()
  const models = data.catalog?.models ?? []
  const navigate = (next: Page) => {
    location.hash = next
    setPage(next)
    window.scrollTo({ top: 0 })
  }
  useEffect(() => {
    const update = () => setPage(readPage(location.hash))
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme !== 'light')
    safeWrite('mvr-theme', theme)
  }, [theme])
  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
    safeWrite('mvr-locale', locale)
  }, [locale])
  useEffect(() => {
    document.title = `${{ explore: 'Explore models', calculator: 'Cost calculator', compare: 'Compare models', insights: 'Price insights', methodology: 'Methodology' }[page]} · ModelValue Radar`
  }, [page])
  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : current.length < 3
          ? [...current, id]
          : current,
    )
  const tabs: { id: Page; label: string }[] = [
    { id: 'explore', label: t('Explore', '发现') },
    { id: 'calculator', label: t('Calculator', '计算器') },
    { id: 'compare', label: t('Compare', '对比') },
    { id: 'insights', label: t('Insights', '洞察') },
  ]
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        {t('Skip to content', '跳转到内容')}
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a href="#explore" className="brand" aria-label="ModelValue Radar home">
            <span className="brand-icon">
              <Radar size={23} />
            </span>
            <span>
              ModelValue<span className="brand-radar"> Radar</span>
              <small>BETA</small>
            </span>
          </a>
          <nav aria-label={t('Main navigation', '主导航')}>
            {tabs.map((tab) => (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                aria-current={page === tab.id ? 'page' : undefined}
                className={page === tab.id ? 'active' : ''}
              >
                {tab.label}
                {tab.id === 'compare' && selected.length > 0 && (
                  <span className="nav-count">{selected.length}</span>
                )}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
              aria-label={locale === 'en' ? '切换为中文' : 'Switch to English'}
              title={locale === 'en' ? '中文' : 'English'}
            >
              <Languages size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={t('Toggle color theme', '切换主题')}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="open-source-button"
              onClick={() => navigate('methodology')}
            >
              <Github size={15} />
              {t('Open source', '开源')}
            </Button>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="site-main">
        {initial.error && (
          <div className="notice error" role="alert">
            {t(
              'This share link is invalid. Default settings have been restored.',
              '分享链接无效，已恢复默认设置。',
            )}
          </div>
        )}
        {page !== 'methodology' && <CatalogStatus data={data} />}
        <Suspense fallback={<Skeleton />}>
          {page === 'explore' ? (
            <Explore
              models={models}
              workload={workload}
              selected={selected}
              toggle={toggle}
              navigate={navigate}
              details={setDetail}
              loading={data.loading}
            />
          ) : page === 'calculator' ? (
            <Calculator
              models={models}
              workload={workload}
              setWorkload={setWorkload}
              selected={selected}
              navigate={navigate}
              compareWith={(ids) => {
                setSelected(ids)
                navigate('compare')
              }}
            />
          ) : page === 'compare' ? (
            <Compare
              models={models}
              selected={selected}
              setSelected={setSelected}
              workload={workload}
              fetchedAt={data.catalog?.fetchedAt}
            />
          ) : page === 'insights' ? (
            <Insights models={models} workload={workload} selected={selected} />
          ) : (
            <Methodology />
          )}
        </Suspense>
      </main>
      <footer className="site-footer">
        <div>
          <a className="brand footer-brand" href="#explore">
            <Radar size={20} />
            ModelValue Radar
          </a>
          <p>
            {t('A clearer choice for your next AI project.', '为下一个 AI 项目，做更清晰的选择。')}
          </p>
        </div>
        <div className="footer-links">
          <a href="#methodology">{t('Data & methodology', '数据与方法')}</a>
          <a
            href="https://openrouter.ai/docs/api/api-reference/models/get-models"
            target="_blank"
            rel="noreferrer"
          >
            {t('API source', 'API 来源')} ↗
          </a>
          <span>
            <Check size={12} />
            {t('MIT licensed code', '代码采用 MIT')}
          </span>
        </div>
        <p className="footer-note">
          {t(
            'Independent project. Not affiliated with model providers. Prices are estimates, not guarantees.',
            '独立项目，与模型提供商无隶属关系。价格为估算，不构成保证。',
          )}
        </p>
      </footer>
      {!!selected.length && page !== 'compare' && (
        <aside className="compare-tray" aria-label={t('Comparison shortlist', '对比候选列表')}>
          <div className="tray-count">
            {selected.length}
            <span>/3</span>
          </div>
          <div className="tray-models">
            {selected.map((id) => (
              <button key={id} onClick={() => toggle(id)} title={t('Remove model', '移除模型')}>
                {(models.find((m) => m.id === id)?.name ?? id).replace(/^[^:]+: /, '')}
                <X size={12} />
              </button>
            ))}
          </div>
          <Button onClick={() => navigate('compare')}>
            {t('Compare models', '比较模型')}
            <ArrowRight size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('Clear comparison', '清空对比')}
            onClick={() => setSelected([])}
          >
            <X size={16} />
          </Button>
        </aside>
      )}
      <ModelDetails model={detail} close={() => setDetail(null)} />
    </>
  )
}
export default function App() {
  const [locale, setLocale] = useState<Locale>(() =>
    safeRead('mvr-locale', 'en') === 'zh' ? 'zh' : 'en',
  )
  return (
    <LocaleContext.Provider value={locale}>
      <Workspace locale={locale} setLocale={setLocale} />
    </LocaleContext.Provider>
  )
}
