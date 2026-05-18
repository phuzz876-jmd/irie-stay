import { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  "What time is check-in? 🔑",
  "What's the WiFi password? 📶",
  "What restaurants are nearby? 🍽️",
  "What activities are in Portland? 🌊",
  "How do I get there from Kingston? 🚗",
  "What are the house rules? 📋",
  "Tell me about the property 🏡",
  "What's the cancellation policy? 💰",
];

function renderMarkdown(text) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      elements.push(<div key={`sp-${i}`} style={{ height: 10 }} />);
      i++;
      continue;
    }
    if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
      const bullets = [];
      while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("• "))) {
        bullets.push(lines[i].trim().replace(/^[-•]\s/, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: "4px 0 4px 4px", paddingLeft: 16 }}>
          {bullets.map((b, j) => <li key={j} style={{ marginBottom: 3, lineHeight: 1.6 }}>{inlineBold(b)}</li>)}
        </ul>
      );
      continue;
    }
    elements.push(<div key={`ln-${i}`} style={{ lineHeight: 1.7, marginBottom: 1 }}>{inlineBold(line)}</div>);
    i++;
  }
  return elements;
}

function inlineBold(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i} style={{ fontWeight: 700 }}>{p.slice(2, -2)}</strong>
      : p
  );
}

export default function IrieStay() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Welcome to Wray Villa Retreat! 🏔️🇯🇲\n\nI'm your **Irie Stay** concierge — your personal guide from the moment you confirmed your booking to the moment you check out.\n\nWhether you're planning your arrival, need directions, want local restaurant tips, or have questions during your stay — I'm here 24/7. One love!\n\nWhat can I help you with? 🌿",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    setShowSuggestions(false);

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Calls OUR backend — API key is safe on the server
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "Sorry, something went wrong. Please try again or contact Cynthia at 876-567-8734. 🙏",
          },
        ]);
        return;
      }

      const reply = data.content?.[0]?.text || "Sorry, something went wrong. Please contact Cynthia at 876-567-8734. 🙏";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Connection issue. Please try again or contact Cynthia directly at 876-567-8734. 🙏" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={s.root}>
      <div style={s.bgLayer} />
      <div style={s.card}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.headerInner}>
            <div style={s.logoMark}>🏡</div>
            <div>
              <div style={s.propertyName}>Wray Villa Retreat</div>
              <div style={s.brandLine}>
                <span style={s.irieBadge}>IRIE STAY</span>
                <span style={s.locationText}>📍 Portland, Jamaica</span>
              </div>
            </div>
          </div>
          <div style={s.livePill}>
            <span style={s.liveDot} />
            Live
          </div>
        </div>

        {/* Highlights */}
        <div style={s.strip}>
          {["6 Bedrooms", "12 Guests", "Starlink 200Mbps", "River Access", "Blue Mtn Views", "60yr Family Home"].map(h => (
            <span key={h} style={s.chip}>{h}</span>
          ))}
        </div>

        {/* Messages */}
        <div style={s.messages}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-end", gap: 8, marginBottom: 16 }}>
              {msg.role === "assistant" && <div style={s.avatar}>🌴</div>}
              <div style={msg.role === "user" ? s.userBubble : s.botBubble}>
                {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 16 }}>
              <div style={s.avatar}>🌴</div>
              <div style={{ ...s.botBubble, display: "flex", gap: 5, alignItems: "center", padding: "14px 18px" }}>
                {[0, 0.18, 0.36].map((d, i) => (
                  <span key={i} style={{ ...s.dot, animationDelay: `${d}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <div style={s.suggestWrap}>
            <div style={s.suggestLabel}>Quick questions ↓</div>
            <div style={s.suggestGrid}>
              {SUGGESTIONS.map(q => (
                <button key={q} style={s.suggestBtn} onClick={() => sendMessage(q)}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={s.inputRow}>
          <textarea
            style={s.textarea}
            rows={1}
            placeholder="Ask about check-in, amenities, local tips…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
          />
          <button
            style={{ ...s.sendBtn, opacity: !input.trim() || loading ? 0.4 : 1 }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >➤</button>
        </div>

        <div style={s.footer}>
          Wray Villa Retreat · Powered by <strong>Irie Stay</strong> 🌿 · Host: Cynthia 876-567-8734
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #05160a; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @media (max-width: 600px) {
      .property-name { font-size: 16px !important; }
      .header-inner { gap: 10px !important; }
    .logo-mark { width: 36px !important; height: 36px !important; font-size: 18px !important; }
}
      `}</style>
    </div>
  );
}

const s = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(150deg, #006994 0%, #004d7a 40%, #008080 70%, #006994 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16, fontFamily: "system-ui, sans-serif", position: "relative",
  },
  bgLayer: {
    position: "absolute", inset: 0, pointerEvents: "none",
   background: "radial-gradient(ellipse at 80% 10%, rgba(255,210,0,0.15) 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(0,255,200,0.1) 0%, transparent 50%)",
  },
  card: {
    width: "100%", maxWidth: 720, background: "#fff",
    borderRadius: 20, overflow: "hidden",
    boxShadow: "0 50px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,210,0,0.15)",
    display: "flex", flexDirection: "column", maxHeight: "94vh",
  },
  header: {
    background: "#006994",
    padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
    borderBottom: "2.5px solid #ffd200",
  },
  headerInner: { display: "flex", alignItems: "center", gap: 14 },
  logoMark: {
    width: 50, height: 50, borderRadius: 14,
    background: "linear-gradient(135deg, rgba(255,210,0,0.18), rgba(255,255,255,0.05))",
    border: "1px solid rgba(255,210,0,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 24, flexShrink: 0,
  },
  propertyName: { fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.2 },
  brandLine: { display: "flex", alignItems: "center", gap: 10, marginTop: 3 },
  irieBadge: {
    background: "#ffd200", color: "#071a0b",
    fontSize: 10, fontWeight: 700, letterSpacing: "1.5px",
    padding: "2px 8px", borderRadius: 4,
  },
  locationText: { fontSize: 12, color: "rgba(255,255,255,0.55)" },
  livePill: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 20, padding: "4px 12px",
    fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600,
  },
  liveDot: {
    width: 7, height: 7, borderRadius: "50%", background: "#00e676",
    boxShadow: "0 0 0 2px rgba(0,230,118,0.3)",
    animation: "pulse 2s infinite", display: "inline-block",
  },
  strip: {
    display: "flex", gap: 6, padding: "9px 16px",
    background: "#f8fdf9", borderBottom: "1px solid #e4ede7", flexWrap: "wrap",
  },
  chip: {
    background: "#e8f5ec", color: "#1a5c28", fontSize: 11, fontWeight: 600,
    padding: "3px 10px", borderRadius: 20, border: "1px solid #c5e0cc", whiteSpace: "nowrap",
  },
  messages: {
    flex: 1, overflowY: "auto", padding: "20px 18px 8px",
    display: "flex", flexDirection: "column", minHeight: 260,
  },
  avatar: {
    width: 34, height: 34, borderRadius: "50%",
    background: "linear-gradient(135deg, #1a5c28, #ffd200)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 17, flexShrink: 0,
  },
  botBubble: {
    background: "#f2fbf4", border: "1px solid #cae8d2",
    borderRadius: "4px 18px 18px 18px", padding: "13px 16px",
    maxWidth: "78%", fontSize: 14, lineHeight: 1.65, color: "#1a2e20",
    animation: "fadeUp 0.25s ease",
  },
  userBubble: {
    background: "#006994",
    borderRadius: "18px 4px 18px 18px", padding: "13px 16px",
    maxWidth: "78%", fontSize: 14, lineHeight: 1.65, color: "#fff",
    animation: "fadeUp 0.25s ease",
  },
  dot: {
    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
    background: "#1a5c28", animation: "bounce 1.1s infinite ease-in-out",
  },
  suggestWrap: { padding: "4px 18px 14px" },
  suggestLabel: {
    fontSize: 11, color: "#8aab92", fontWeight: 600,
    textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8,
  },
  suggestGrid: { display: "flex", flexWrap: "wrap", gap: 7 },
  suggestBtn: {
    background: "#fff", border: "1.5px solid #1a5c28", borderRadius: 18,
    padding: "6px 13px", fontSize: 12.5, color: "#1a3d20",
    cursor: "pointer", fontWeight: 600,
  },
  inputRow: {
    display: "flex", alignItems: "flex-end", gap: 10,
    padding: "10px 18px 12px", borderTop: "1px solid #e8f0ec", background: "#fafcfa",
  },
  textarea: {
    flex: 1, border: "1.5px solid #c5dece", borderRadius: 12,
    padding: "10px 14px", fontSize: 14, color: "#1a2e20",
    resize: "none", outline: "none", background: "#fff", lineHeight: 1.5,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 12,
    background: "linear-gradient(135deg, #0d2e12, #1a5c28)",
    border: "none", color: "#ffd200", fontSize: 17,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: "opacity 0.2s",
  },
  footer: {
    textAlign: "center", fontSize: 11, color: "#8aab92", padding: "6px 0 10px",
  },
};
