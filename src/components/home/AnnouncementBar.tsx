type Props = {
  text: string
}

export function AnnouncementBar({ text }: Props) {
  if (!text.trim()) return null
  return (
    <div className="announcement-bar" role="status">
      <p className="announcement-bar-text">{text}</p>
    </div>
  )
}
