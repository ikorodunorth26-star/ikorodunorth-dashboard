type DashboardSectionProps = {
  title: string
  summary: string
}

export function DashboardSection({ title, summary }: DashboardSectionProps) {
  return (
    <section className="max-w-3xl rounded-[28px] border border-border bg-card px-6 py-8 text-card-foreground md:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
        Ikorodu North LCDA
      </p>
      <h1 className="mt-3 text-[32px] font-bold leading-tight tracking-[-0.02em]">
        {title}
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-6 text-muted-foreground">
        {summary}
      </p>
    </section>
  )
}
