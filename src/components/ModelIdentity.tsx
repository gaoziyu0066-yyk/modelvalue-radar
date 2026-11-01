import type { Model } from '../types/model'
export function ModelIdentity({ model, small = false }: { model: Model; small?: boolean }) {
  const color = ['#9b8afb', '#69b7f7', '#e5a479', '#6dc9b7'][
    Array.from(model.provider).reduce((n, c) => n + c.charCodeAt(0), 0) % 4
  ]
  return (
    <div className="model-identity">
      <span
        className={`model-avatar ${small ? 'small' : ''}`}
        style={{ color, backgroundColor: `${color}15` }}
        aria-hidden="true"
      >
        {model.provider.slice(0, 2).toUpperCase()}
      </span>
      <span>
        <strong>{model.name.replace(/^[^:]+: /, '')}</strong>
        <small>{model.provider}</small>
      </span>
    </div>
  )
}
