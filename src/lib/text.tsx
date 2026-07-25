/** Renders a heading with its last word in the honey accent color. */
export function AccentTitle({ text }: { text: string }) {
  const i = text.lastIndexOf(" ");
  if (i === -1) return <span className="text-accent">{text}</span>;
  return (
    <>
      {text.slice(0, i + 1)}
      <span className="text-accent">{text.slice(i + 1)}</span>
    </>
  );
}
