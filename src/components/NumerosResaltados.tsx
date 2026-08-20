export default function NumerosResaltados({ texto }: { texto: string }) {
  const partes = texto.split(/(\d+)/g)
  return (
    <div className="transcripcion-preview" aria-hidden="true">
      {partes.map((parte, i) =>
        /^\d+$/.test(parte) ? (
          <strong key={i} className="numero-resaltado">{parte}</strong>
        ) : (
          <span key={i}>{parte}</span>
        )
      )}
    </div>
  )
}