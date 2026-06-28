export const LoadingState = ({ message = 'Loading data...' }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 h-full">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
      <p className="text-body-sm text-on-surface-muted">{message}</p>
    </div>
  )
}
