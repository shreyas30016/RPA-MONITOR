interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  isPending: boolean
}

export const SearchBar = ({ value, onChange, isPending }: SearchBarProps) => (
  <div className="relative flex items-center w-[300px]">
    <span className="material-symbols-outlined absolute left-3 text-on-surface-muted text-[18px]">
      search
    </span>
    <input
      type="text"
      id="global-search-input"
      name="global-search-input"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Search project, company, partner..."
      className="w-full bg-surface-container-high border border-border/50 rounded-full py-1.5 pl-10 pr-4 text-body-sm text-on-surface placeholder:text-on-surface-muted focus:ring-1 focus:ring-primary focus:outline-none transition-shadow"
    />
    {isPending && (
      <span className="absolute right-3 text-[10px] text-on-surface-muted animate-pulse">
        ...
      </span>
    )}
  </div>
)
