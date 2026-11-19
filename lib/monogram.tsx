// Monogram on the profile navy with the blue selection frame.
export function monogram(px: number) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0C1424",
        color: "#EEF3FB",
        fontSize: px * 0.5,
        letterSpacing: -px * 0.02,
        border: `${Math.max(2, Math.round(px / 22))}px solid #4C9AFF`,
      }}
    >
      TH
    </div>
  )
}
