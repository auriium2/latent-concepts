// nerv-ui imports available but not used yet in this iteration

// Inline nerv-ui styles since we don't have their Tailwind setup
const nervColors = {
  orange: '#FF9900',
  cyan: '#00F6FF',
  green: '#00FF00',
  red: '#FF2B1D',
  panel: '#0A0A0A',
  darkGray: '#121212',
};

const monoFont = "'Fira Code', 'JetBrains Mono', 'Courier New', monospace";
const displayFont = "'Oswald', 'Arial Narrow', system-ui, sans-serif";

export default function NervJepa() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 2,
      pointerEvents: 'none',
      fontFamily: monoFont,
    }}>
      {/* Top-left info boxes */}
      <div style={{ position: 'absolute', top: 16, left: 70, display: 'flex', flexDirection: 'column', gap: 4, pointerEvents: 'auto' }}>
        <NervLabel text="LATENT SPACE ENCODER" color={nervColors.orange} />
        <NervLabel text="MASK PREDICTION UNIT" color={nervColors.orange} />
        <NervLabel text="REPRESENTATION LAYER" color={nervColors.orange} />
      </div>

      {/* Top-right status badges */}
      <div style={{ position: 'absolute', top: 16, right: 24, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', pointerEvents: 'auto' }}>
        <NervLabel text="SYSTEM STATUS: NOMINAL" color={nervColors.green} />
        <NervLabel text="SYNC RATIO: 94.7%" color={nervColors.cyan} />
        <NervLabel text="PATTERN: BLUE" color={nervColors.cyan} />
      </div>

      {/* Center JEPA architecture labels */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(85vw, 820px)',
        height: 'min(70vh, 460px)',
      }}>
        {/* Context encoder */}
        <NervPanel
          x="18%" y="5%" w="12%" h="38%"
          label="E&#x3B8;" sublabel="CONTEXT ENCODER"
          color={nervColors.orange}
        />

        {/* Predictor */}
        <NervPanel
          x="56%" y="5%" w="12%" h="38%"
          label="P&#x3C6;" sublabel="PREDICTOR"
          color={nervColors.green}
        />

        {/* Target encoder */}
        <NervPanel
          x="18%" y="57%" w="12%" h="38%"
          label="E&#x3B8;&#x0304;" sublabel="TARGET ENCODER"
          color={nervColors.orange} dim
        />

        {/* Loss */}
        <NervPanel
          x="78%" y="28%" w="10%" h="44%"
          label="L&#x2081;" sublabel="LOSS"
          color={nervColors.red}
        />

        {/* EMA label */}
        <div style={{
          position: 'absolute',
          left: '24%',
          top: '48%',
          transform: 'translate(-50%, -50%)',
          color: nervColors.orange,
          opacity: 0.5,
          fontSize: 9,
          fontFamily: displayFont,
          letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
        }}>
          EMA
        </div>

        {/* Stop-grad label */}
        <div style={{
          position: 'absolute',
          left: '60%',
          top: '82%',
          color: nervColors.red,
          opacity: 0.7,
          fontSize: 9,
          fontFamily: displayFont,
          letterSpacing: '0.15em',
        }}>
          STOP-GRAD
        </div>

        {/* V-JEPA title */}
        <div style={{
          position: 'absolute',
          bottom: -30,
          left: '50%',
          transform: 'translateX(-50%)',
          color: nervColors.orange,
          opacity: 0.4,
          fontSize: 11,
          fontFamily: displayFont,
          letterSpacing: '0.3em',
        }}>
          V-JEPA ARCHITECTURE
        </div>
      </div>

      {/* Bottom status bar */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: 70,
        right: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'auto',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <NervLabel text="MAGI-01: ONLINE" color={nervColors.green} small />
          <NervLabel text="MAGI-02: ONLINE" color={nervColors.green} small />
          <NervLabel text="MAGI-03: STANDBY" color={nervColors.orange} small />
        </div>
        <NervLabel text="NERV HQ // TOKYO-3" color={nervColors.orange} small />
      </div>
    </div>
  );
}

// Simple NERV-style label box
function NervLabel({ text, color, small }: { text: string; color: string; small?: boolean }) {
  return (
    <div style={{
      background: `${color}11`,
      border: `1px solid ${color}`,
      padding: small ? '2px 8px' : '3px 10px',
      fontSize: small ? 9 : 10,
      fontFamily: displayFont,
      letterSpacing: '0.15em',
      color: color,
      textTransform: 'uppercase' as const,
      whiteSpace: 'nowrap' as const,
      boxShadow: `inset 0 0 8px ${color}22`,
    }}>
      {text}
    </div>
  );
}

// NERV-style panel with targeting brackets
function NervPanel({ x, y, w, h, label, sublabel, color, dim }: {
  x: string; y: string; w: string; h: string;
  label: string; sublabel: string; color: string; dim?: boolean;
}) {
  const opacity = dim ? 0.5 : 0.85;
  const bLen = 10;

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      opacity,
    }}>
      {/* Panel background */}
      <div style={{
        width: '100%',
        height: '100%',
        background: nervColors.panel,
        border: `1px solid ${color}`,
        boxShadow: `inset 0 0 12px ${color}15, 0 0 6px ${color}10`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Scanlines */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 1px, ${color}08 1px, ${color}08 2px)`,
          pointerEvents: 'none' as const,
        }} />

        {/* Corner brackets */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' as const }} preserveAspectRatio="none">
          <line x1="0" y1={bLen} x2="0" y2="0" stroke={color} strokeWidth="2.5" />
          <line x1="0" y1="0" x2={bLen} y2="0" stroke={color} strokeWidth="2.5" />

          <line x1="100%" y1={bLen} x2="100%" y2="0" stroke={color} strokeWidth="2.5" />
          <line x1="100%" y1="0" x2={`calc(100% - ${bLen}px)`} y2="0" stroke={color} strokeWidth="2.5" />

          <line x1="0" y1={`calc(100% - ${bLen}px)`} x2="0" y2="100%" stroke={color} strokeWidth="2.5" />
          <line x1="0" y1="100%" x2={bLen} y2="100%" stroke={color} strokeWidth="2.5" />

          <line x1="100%" y1={`calc(100% - ${bLen}px)`} x2="100%" y2="100%" stroke={color} strokeWidth="2.5" />
          <line x1="100%" y1="100%" x2={`calc(100% - ${bLen}px)`} y2="100%" stroke={color} strokeWidth="2.5" />
        </svg>

        {/* Label */}
        <span
          style={{
            color,
            fontSize: 18,
            fontFamily: displayFont,
            fontWeight: 700,
            letterSpacing: '0.1em',
            zIndex: 1,
          }}
          dangerouslySetInnerHTML={{ __html: label }}
        />
        <span style={{
          color,
          fontSize: 8,
          fontFamily: displayFont,
          letterSpacing: '0.2em',
          opacity: 0.5,
          marginTop: 4,
          zIndex: 1,
        }}>
          {sublabel}
        </span>
      </div>
    </div>
  );
}
