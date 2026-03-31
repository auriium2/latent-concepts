      const canvas = document.getElementById("jepa");
      const ctx = canvas.getContext("2d");

      let w, h;

      function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      }
      resize();
      window.addEventListener("resize", resize);

      // EVA colors
      const EVA_ORANGE = "rgb(255, 120, 0)";
      const EVA_ORANGE_DIM = "rgba(255, 120, 0, 0.5)";
      const EVA_ORANGE_GLOW = "rgba(255, 120, 0, 0.15)";
      const EVA_RED = "rgb(220, 40, 40)";
      const EVA_GREEN = "rgb(0, 200, 80)";
      const EVA_BLUE = "rgb(60, 160, 255)";
      const EVA_BLUE_DIM = "rgba(60, 160, 255, 0.4)";

      // Layout (relative to center) — symmetric, centered
      const ROW_TOP = -130;
      const ROW_BOT = 80;
      const ROW_H = 120;
      const ENC_SIZE = 70;
      const J = {
        ctxFrames:  { x: -400, y: ROW_TOP,      w: 80, h: ROW_H },
        ctxEncoder: { x: -240, y: ROW_TOP + (ROW_H - ENC_SIZE) / 2, w: ENC_SIZE, h: ENC_SIZE },
        ctxTokens:  { x: -80,  y: ROW_TOP,      w: 100, h: ROW_H },
        predictor:  { x: 100,  y: ROW_TOP + (ROW_H - ENC_SIZE) / 2, w: ENC_SIZE, h: ENC_SIZE },
        tgtFrames:  { x: -400, y: ROW_BOT,      w: 80, h: ROW_H },
        tgtEncoder: { x: -240, y: ROW_BOT + (ROW_H - ENC_SIZE) / 2, w: ENC_SIZE, h: ENC_SIZE },
        tgtTokens:  { x: -80,  y: ROW_BOT,      w: 100, h: ROW_H },
        loss:       { x: 280,  y: (ROW_TOP + ROW_BOT + ROW_H) / 2 - 35, w: ENC_SIZE, h: ENC_SIZE },
      };

      function flk(t, seed) {
        return 0.88 + Math.sin(t * 4 + seed) * 0.08 + Math.random() * 0.04;
      }

      function drawEvaBox(x, y, bw, bh, color, fillColor, symbol, t) {
        const f = flk(t, x * 0.02);
        ctx.save();
        ctx.globalAlpha = f;

        // Fill
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, bw, bh);

        // Notched border
        const n = 8;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + n, y); ctx.lineTo(x + bw - n, y); ctx.lineTo(x + bw, y + n);
        ctx.lineTo(x + bw, y + bh - n); ctx.lineTo(x + bw - n, y + bh);
        ctx.lineTo(x + n, y + bh); ctx.lineTo(x, y + bh - n); ctx.lineTo(x, y + n);
        ctx.closePath();
        ctx.stroke();

        // Corner accents
        ctx.lineWidth = 2;
        const c = 12;
        ctx.beginPath(); ctx.moveTo(x, y + n + c); ctx.lineTo(x, y + n); ctx.lineTo(x + n, y); ctx.lineTo(x + n + c, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + bw - n - c, y); ctx.lineTo(x + bw - n, y); ctx.lineTo(x + bw, y + n); ctx.lineTo(x + bw, y + n + c); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + bw, y + bh - n - c); ctx.lineTo(x + bw, y + bh - n); ctx.lineTo(x + bw - n, y + bh); ctx.lineTo(x + bw - n - c, y + bh); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + n + c, y + bh); ctx.lineTo(x + n, y + bh); ctx.lineTo(x, y + bh - n); ctx.lineTo(x, y + bh - n - c); ctx.stroke();

        // Symbol
        ctx.fillStyle = color;
        ctx.font = "bold 16px 'Inter Variable', 'Inter', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(symbol, x + bw / 2, y + bh / 2);

        ctx.restore();
      }

      // Simple arrow — clean line with chevron head
      function drawArrow(x1, y1, x2, y2, color, t, dashed = false) {
        var f = flk(t, x1 * 0.01);
        ctx.save();
        ctx.globalAlpha = f * 0.7;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        if (dashed) ctx.setLineDash([8, 6]);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Filled chevron arrowhead
        var a = Math.atan2(y2 - y1, x2 - x1);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 9 * Math.cos(a - 0.35), y2 - 9 * Math.sin(a - 0.35));
        ctx.lineTo(x2 - 5 * Math.cos(a), y2 - 5 * Math.sin(a));
        ctx.lineTo(x2 - 9 * Math.cos(a + 0.35), y2 - 9 * Math.sin(a + 0.35));
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // Isometric token grid — stacked slanted planes like the V-JEPA paper
      // Clean token grid for the JEPA diagram
      function drawIsoTokenGrid(x, y, gw, gh, color, dimColor, t, maskRatio) {
        const layers = 4;
        const cols = 4;
        const gridRows = 5;
        const cellW = gw / cols;
        const cellH = gh / gridRows;
        const layerOffsetX = -8;
        const layerOffsetY = -8;
        const f = flk(t, x * 0.02);

        ctx.save();
        const midX = x + gw / 2;
        const midY = y + gh / 2;
        ctx.translate(midX, midY);
        ctx.rotate(-0.15);
        ctx.translate(-midX, -midY);

        for (let l = 0; l < layers; l++) {
          const lx = x + l * layerOffsetX;
          const ly = y + l * layerOffsetY;
          const layerAlpha = f * (0.3 + (layers - 1 - l) * 0.2);
          ctx.globalAlpha = layerAlpha;

          for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < cols; c++) {
              const cx = lx + c * cellW;
              const cy = ly + r * cellH;
              const seed = Math.sin(r * 127.1 + c * 311.7 + l * 74.3 + Math.floor(t * 1.5) * 43.7) * 43758.5453;
              const hash = seed - Math.floor(seed);
              const isMasked = hash < maskRatio;

              if (l === 0) {
                ctx.fillStyle = isMasked ? "rgba(255,255,255,0.05)" : dimColor;
                ctx.fillRect(cx + 0.5, cy + 0.5, cellW - 1, cellH - 1);
              }
              ctx.strokeStyle = color;
              ctx.lineWidth = 0.5;
              ctx.strokeRect(cx + 0.5, cy + 0.5, cellW - 1, cellH - 1);
            }
          }
        }
        ctx.restore();
      }

      // Experiment grid with ghost layers + letter animation (for standalone use)
      function drawExperimentGrid(x, y, gw, gh, color, dimColor, t, maskRatio, gridSize = 6) {
        const gridLayers = 4;
        const ghostLayers = 5;
        const layers = gridLayers + ghostLayers;
        const cols = gridSize;
        const gridRows = gridSize;
        const cellW = gw / cols;
        const cellH = gh / gridRows;
        const layerOffsetX = -14;
        const layerOffsetY = -14;
        const f = flk(t, x * 0.02);

        ctx.save();
        const midX = x + gw / 2;
        const midY = y + gh / 2;
        ctx.translate(midX, midY);
        ctx.rotate(-0.15);
        ctx.translate(-midX, -midY);

        const letters = {
          L: [[1,0,0,0,0,0],[1,0,0,0,0,0],[1,0,0,0,0,0],[1,0,0,0,0,0],[1,0,0,0,0,0],[1,1,1,1,1,0]],
          A: [[0,0,1,1,0,0],[0,1,0,0,1,0],[1,0,0,0,0,1],[1,1,1,1,1,1],[1,0,0,0,0,1],[1,0,0,0,0,1]],
          T: [[1,1,1,1,1,1],[0,0,1,1,0,0],[0,0,1,1,0,0],[0,0,1,1,0,0],[0,0,1,1,0,0],[0,0,1,1,0,0]],
          E: [[1,1,1,1,1,1],[1,0,0,0,0,0],[1,1,1,1,0,0],[1,0,0,0,0,0],[1,0,0,0,0,0],[1,1,1,1,1,1]],
          N: [[1,0,0,0,0,1],[1,1,0,0,0,1],[1,0,1,0,0,1],[1,0,0,1,0,1],[1,0,0,0,1,1],[1,0,0,0,0,1]],
          C: [[0,1,1,1,1,0],[1,0,0,0,0,0],[1,0,0,0,0,0],[1,0,0,0,0,0],[1,0,0,0,0,0],[0,1,1,1,1,0]],
          O: [[0,1,1,1,1,0],[1,0,0,0,0,1],[1,0,0,0,0,1],[1,0,0,0,0,1],[1,0,0,0,0,1],[0,1,1,1,1,0]],
          P: [[1,1,1,1,1,0],[1,0,0,0,0,1],[1,1,1,1,1,0],[1,0,0,0,0,0],[1,0,0,0,0,0],[1,0,0,0,0,0]],
          S: [[0,1,1,1,1,1],[1,0,0,0,0,0],[0,1,1,1,1,0],[0,0,0,0,0,1],[0,0,0,0,0,1],[1,1,1,1,1,0]],
          _: [[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]],
        };
        const sequence = "LATENT___CONCEPTS___";
        const frame = Math.floor(t * 0.7);
        const frameIdx = frame % sequence.length;
        const ch = sequence[frameIdx];
        const currentLetter = letters[ch];

        for (let l = 0; l < layers; l++) {
          const lx = x + l * layerOffsetX;
          const ly = y + l * layerOffsetY;
          const layerAlpha = l < gridLayers
            ? f * (0.7 + (gridLayers - 1 - l) * 0.15)
            : f * (0.7 - (l - gridLayers) * 0.07);
          ctx.globalAlpha = layerAlpha;

          if (l >= gridLayers) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.5;
            ctx.strokeRect(lx, ly, gw, gh);
          } else {
            for (let r = 0; r < gridRows; r++) {
              for (let c = 0; c < cols; c++) {
                const cx = lx + c * cellW;
                const cy = ly + r * cellH;
                const isLetter = ch !== '_';
                const isLetterCell = isLetter && currentLetter && currentLetter[r]?.[c] === 1;

                let isMasked;
                if (isLetter) {
                  isMasked = !isLetterCell;
                } else {
                  const seed = Math.sin(r * 127.1 + c * 311.7 + l * 74.3 + frame * 43.7) * 43758.5453;
                  const hash = seed - Math.floor(seed);
                  isMasked = hash < maskRatio;
                }

                if (l === 0) {
                  ctx.fillStyle = isMasked ? "rgba(255,255,255,0.05)" : dimColor;
                  ctx.fillRect(cx + 0.5, cy + 0.5, cellW - 1, cellH - 1);
                }
                ctx.strokeStyle = color;
                ctx.lineWidth = 0.5;
                ctx.strokeRect(cx + 0.5, cy + 0.5, cellW - 1, cellH - 1);
              }
            }
          }
        }
        ctx.restore();
      }

      // Stacked frames (input video) — more opaque
      function drawFrameStack(x, y, fw, fh, color, t, bright) {
        const f = bright ? 0.9 : (0.7 + Math.sin(t * 2.5 + x * 0.01) * 0.15);
        ctx.save();

        for (let i = 3; i >= 0; i--) {
          const ox = x + i * 7;
          const oy = y - i * 7;
          const frameW = fw - 14;
          const frameH = fh - 14;

          // Fill for visibility
          ctx.globalAlpha = f * (0.08 + (3 - i) * 0.06);
          ctx.fillStyle = color;
          ctx.fillRect(ox, oy, frameW, frameH);

          // Border
          ctx.globalAlpha = f * (0.35 + (3 - i) * 0.2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.2;
          ctx.strokeRect(ox, oy, frameW, frameH);

          // Scanlines
          ctx.globalAlpha = f * (0.04 + (3 - i) * 0.03);
          for (let s = 0; s < frameH; s += 3) {
            ctx.fillStyle = color;
            ctx.fillRect(ox, oy + s, frameW, 1);
          }
        }
        ctx.restore();
      }

      // Simple right-angle elbow arrow
      function drawElbowArrow(x1, y1, x2, y2, color, t, dashed = false) {
        var f = flk(t, x1 * 0.01);
        var r = 12;
        var goingDown = y2 > y1;

        ctx.save();
        ctx.globalAlpha = f * 0.7;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        if (dashed) ctx.setLineDash([8, 6]);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2 - r, y1);
        if (goingDown) {
          ctx.arcTo(x2, y1, x2, y1 + r, r);
        } else {
          ctx.arcTo(x2, y1, x2, y1 - r, r);
        }
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrowhead
        var dir = goingDown ? 1 : -1;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 5, y2 - 9 * dir);
        ctx.lineTo(x2, y2 - 5 * dir);
        ctx.lineTo(x2 + 5, y2 - 9 * dir);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // Stop-grad marker
      function drawStopGrad(x, y, color, t) {
        ctx.save();
        ctx.globalAlpha = flk(t, 0);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 7); ctx.lineTo(x + 5, y + 7);
        ctx.moveTo(x + 1, y - 7); ctx.lineTo(x + 11, y + 7);
        ctx.stroke();
        ctx.restore();
      }

      function drawJepa(t) {
        ctx.clearRect(0, 0, w, h);

        /* === Token grid experiment (hidden) ===
        ctx.save();
        ctx.translate(w * 0.5, h * 0.5);
        const flicker = 0.85 + Math.random() * 0.1 + Math.sin(t * 30) * 0.03;
        ctx.globalAlpha = flicker;
        drawExperimentGrid(-175, -210, 350, 420, EVA_BLUE, EVA_BLUE_DIM, t, 0.7, 8);
        ctx.restore();
        */

        // Reset arrow index for sequential pulsing


        // === Background grid (NERV-style 24px orange) ===
        ctx.save();
        ctx.globalAlpha = 0.04;
        ctx.strokeStyle = "#FF9900";
        ctx.lineWidth = 0.5;
        for (var gx = 0; gx < w; gx += 24) {
          ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
        }
        for (var gy = 0; gy < h; gy += 24) {
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
        }
        ctx.restore();

        // === Left graph marks ===
        ctx.save();
        var markX = 40;
        var markStart = h - 30;
        var markStep = 55;
        var markCount = Math.floor((markStart - 20) / markStep);
        ctx.strokeStyle = "#FF9900";
        ctx.fillStyle = "#FF9900";
        ctx.font = "bold 10px 'Oswald', 'Arial Narrow', monospace";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        // Vertical line
        ctx.globalAlpha = 0.15;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(markX, markStart);
        ctx.lineTo(markX, 15);
        ctx.stroke();

        for (var i = 0; i < markCount; i++) {
          var my = markStart - i * markStep;
          ctx.globalAlpha = 0.25 + Math.sin(t * 2 + i * 0.5) * 0.08;

          // Tick
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(markX - 6, my);
          ctx.lineTo(markX + 6, my);
          ctx.stroke();

          // Label
          ctx.fillText("+" + String(i + 1).padStart(2, "0"), markX - 10, my);
        }
        ctx.restore();

        // === Right graph marks (mirrored) ===
        ctx.save();
        var markXR = w - 40;
        ctx.strokeStyle = "#FF9900";
        ctx.fillStyle = "#FF9900";
        ctx.font = "bold 10px 'Oswald', 'Arial Narrow', monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        // Vertical line
        ctx.globalAlpha = 0.15;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(markXR, markStart);
        ctx.lineTo(markXR, 15);
        ctx.stroke();

        for (var j = 0; j < markCount; j++) {
          var myR = markStart - j * markStep;
          ctx.globalAlpha = 0.25 + Math.sin(t * 2 + j * 0.5) * 0.08;

          // Tick
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(markXR - 6, myR);
          ctx.lineTo(markXR + 6, myR);
          ctx.stroke();

          // Label
          ctx.fillText("+" + String(j + 1).padStart(2, "0"), markXR + 10, myR);
        }
        ctx.restore();

        // === Scanline overlay (CRT) ===
        ctx.save();
        ctx.globalAlpha = 0.025;
        ctx.fillStyle = "#000";
        for (var sy = 0; sy < h; sy += 4) {
          ctx.fillRect(0, sy, w, 2);
        }
        ctx.restore();

        // === Helper to draw a full JEPA diagram at a given offset/scale ===
        // NERV-style panel (drawn on canvas)
        function drawNervPanel(x, y, pw, ph, color, label, dim) {
          var f = flk(t, x * 0.02) * (dim ? 0.5 : 0.9);
          ctx.save();
          ctx.globalAlpha = f;

          // Panel fill
          ctx.fillStyle = "#0A0A0A";
          ctx.fillRect(x, y, pw, ph);

          // Border
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, pw, ph);

          // Scanlines
          ctx.globalAlpha = f * 0.04;
          for (var s = 0; s < ph; s += 2) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y + s, pw, 1);
          }
          ctx.globalAlpha = f;

          // Glow
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
          ctx.strokeStyle = color;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, pw, ph);
          ctx.shadowBlur = 0;

          // Label
          ctx.fillStyle = color;
          ctx.font = "bold 16px 'Oswald', 'Arial Narrow', monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, x + pw / 2, y + ph / 2);

          // Dashed outer bracket
          ctx.globalAlpha = f * 0.3;
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(x - 6, y - 6, pw + 12, ph + 12);
          ctx.setLineDash([]);

          ctx.restore();
        }

        // mode: "train" = full V-JEPA, "probe" = frozen encoder → probe → task
        function drawJepaDiagram(offsetY, s, layout, mode, title) {
          ctx.save();
          ctx.translate(w / 2, h * offsetY);
          ctx.scale(s, s);

          var L = layout;
          var ctxMidY = L.ctxFrames.y + L.ctxFrames.h / 2;
          var tgtMidY = L.tgtFrames.y + L.tgtFrames.h / 2;
          var lossCX = L.loss.x + L.loss.w / 2;
          var gap = 10;
          var gridPad = 25;

          // Title
          ctx.save();
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = EVA_ORANGE;
          ctx.font = "600 12px 'Oswald', 'Arial Narrow', monospace";
          ctx.textAlign = "center";
          ctx.letterSpacing = "3px";
          ctx.fillText(title, 0, L.ctxFrames.y - 50);
          ctx.restore();

          if (mode === "train") {
            // === Full V-JEPA training diagram ===
            // Frame stacks
            drawFrameStack(L.ctxFrames.x, L.ctxFrames.y, L.ctxFrames.w, L.ctxFrames.h, EVA_ORANGE, t, true);
            drawFrameStack(L.tgtFrames.x, L.tgtFrames.y, L.tgtFrames.w, L.tgtFrames.h, EVA_ORANGE, t, false);

            // Panels
            drawNervPanel(L.ctxEncoder.x, L.ctxEncoder.y, L.ctxEncoder.w, L.ctxEncoder.h, EVA_ORANGE, "E\u03B8", false);
            drawNervPanel(L.predictor.x, L.predictor.y, L.predictor.w, L.predictor.h, EVA_GREEN, "P\u03C6", false);
            drawNervPanel(L.tgtEncoder.x, L.tgtEncoder.y, L.tgtEncoder.w, L.tgtEncoder.h, EVA_ORANGE, "E\u03B8\u0304", true);
            drawNervPanel(L.loss.x, L.loss.y, L.loss.w, L.loss.h, EVA_RED, "L\u2081", false);

            // Panel labels (same style as frozen label)
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(t * 2) * 0.15;
            ctx.font = "bold 8px 'Oswald', monospace";
            ctx.textAlign = "center";
            ctx.fillStyle = EVA_ORANGE;
            ctx.fillText("CONTEXT", L.ctxEncoder.x + L.ctxEncoder.w / 2, L.ctxEncoder.y + L.ctxEncoder.h + 14);
            ctx.fillText("TARGET", L.tgtEncoder.x + L.tgtEncoder.w / 2, L.tgtEncoder.y + L.tgtEncoder.h + 14);
            ctx.fillStyle = EVA_GREEN;
            ctx.fillText("PREDICTOR", L.predictor.x + L.predictor.w / 2, L.predictor.y + L.predictor.h + 14);
            ctx.fillStyle = EVA_RED;
            ctx.fillText("LOSS", L.loss.x + L.loss.w / 2, L.loss.y + L.loss.h + 14);
            ctx.restore();

            // Token grids
            drawIsoTokenGrid(L.ctxTokens.x, L.ctxTokens.y, L.ctxTokens.w, L.ctxTokens.h, "rgb(0, 246, 255)", "rgba(0, 246, 255, 0.35)", t, 0.4);
            drawIsoTokenGrid(L.tgtTokens.x, L.tgtTokens.y, L.tgtTokens.w, L.tgtTokens.h, "rgb(0, 246, 255)", "rgba(0, 246, 255, 0.35)", t, 0);

            // Arrows
            var ctxFR = L.ctxFrames.x + L.ctxFrames.w - 14;
            var tgtFR = L.tgtFrames.x + L.tgtFrames.w - 14;

            drawArrow(ctxFR + gap, ctxMidY, L.ctxEncoder.x - gap, ctxMidY, EVA_ORANGE, t);
            drawArrow(tgtFR + gap, tgtMidY, L.tgtEncoder.x - gap, tgtMidY, EVA_ORANGE, t);
            drawArrow(L.ctxEncoder.x + L.ctxEncoder.w + gap, ctxMidY, L.ctxTokens.x - gridPad, ctxMidY, EVA_ORANGE, t);
            drawArrow(L.tgtEncoder.x + L.tgtEncoder.w + gap, tgtMidY, L.tgtTokens.x - gridPad, tgtMidY, EVA_ORANGE, t);
            drawArrow(L.ctxTokens.x + L.ctxTokens.w + 15 + gap, ctxMidY, L.predictor.x - gap, ctxMidY, "rgb(0, 246, 255)", t);

            // Elbow arrows to loss
            drawElbowArrow(L.predictor.x + L.predictor.w + gap, ctxMidY, lossCX, L.loss.y - gap, EVA_RED, t, true);
            drawElbowArrow(L.tgtTokens.x + L.tgtTokens.w + 15 + gap, tgtMidY, lossCX, L.loss.y + L.loss.h + gap, EVA_RED, t, true);

            // Stop-grad
            var sgX = L.tgtTokens.x + L.tgtTokens.w + 15 + gap + (lossCX - L.tgtTokens.x - L.tgtTokens.w - 15 - gap) * 0.4;
            drawStopGrad(sgX, tgtMidY - 3, EVA_RED, t);

            // EMA
            var emaX = L.ctxEncoder.x + L.ctxEncoder.w / 2;
            drawArrow(emaX, L.ctxEncoder.y + L.ctxEncoder.h + gap, emaX, L.tgtEncoder.y - gap, EVA_ORANGE, t, true);

          } else if (mode === "probe") {
            // === Frozen encoder → probe evaluation ===
            // Single row: frames → frozen encoder → representations → probe → output
            var midY = 0; // centered vertically

            // Frame stack (input video)
            drawFrameStack(L.ctxFrames.x, -60, L.ctxFrames.w, ROW_H, EVA_ORANGE, t, true);

            // Frozen encoder (with ice/lock indicator)
            var encX = L.ctxEncoder.x;
            var encY = midY - ENC_SIZE / 2;
            drawNervPanel(encX, encY, ENC_SIZE, ENC_SIZE, "#4488AA", "E\u03B8", false);

            // "FROZEN" label below encoder
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(t * 2) * 0.15;
            ctx.fillStyle = "#4488AA";
            ctx.font = "bold 8px 'Oswald', monospace";
            ctx.textAlign = "center";
            ctx.fillText("FROZEN", encX + ENC_SIZE / 2, encY + ENC_SIZE + 12);
            // Lock icon (simple padlock shape)
            var lx = encX + ENC_SIZE / 2;
            var ly = encY - 10;
            ctx.strokeStyle = "#4488AA";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(lx, ly - 4, 5, Math.PI, 0);
            ctx.stroke();
            ctx.strokeRect(lx - 5, ly, 10, 8);
            ctx.restore();

            // Representations (token grid, single)
            drawIsoTokenGrid(L.ctxTokens.x, -60, L.ctxTokens.w, ROW_H, "rgb(0, 246, 255)", "rgba(0, 246, 255, 0.35)", t, 0.15);

            // Probe head
            var probeX = L.predictor.x;
            var probeY = midY - ENC_SIZE / 2;
            drawNervPanel(probeX, probeY, ENC_SIZE, ENC_SIZE, "#FF00FF", "f\u03C8", false);

            // Output / task label
            var outX = L.loss.x;
            var outY = midY - ENC_SIZE / 2;
            drawNervPanel(outX, outY, ENC_SIZE, ENC_SIZE, EVA_GREEN, "\u0177", false);

            // Labels (same style as frozen)
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(t * 2) * 0.15;
            ctx.font = "bold 8px 'Oswald', monospace";
            ctx.textAlign = "center";
            ctx.fillStyle = "#FF00FF";
            ctx.fillText("PROBE", probeX + ENC_SIZE / 2, probeY + ENC_SIZE + 12);
            ctx.fillStyle = EVA_GREEN;
            ctx.fillText("OUTPUT", outX + ENC_SIZE / 2, outY + ENC_SIZE + 12);
            ctx.restore();

            // Arrows: frames → encoder → tokens → probe → output
            var fR = L.ctxFrames.x + L.ctxFrames.w - 14;
            drawArrow(fR + gap, midY, encX - gap, midY, "#4488AA", t);
            drawArrow(encX + ENC_SIZE + gap, midY, L.ctxTokens.x - gridPad, midY, "#4488AA", t);
            drawArrow(L.ctxTokens.x + L.ctxTokens.w + 15 + gap, midY, probeX - gap, midY, "rgb(0, 246, 255)", t);
            drawArrow(probeX + ENC_SIZE + gap, midY, outX - gap, midY, "#FF00FF", t);

          }

          ctx.restore();
        }

        // === V-JEPA (centered) ===
        var diagramScale = Math.min(w / 1050, h / 900, 0.75);
        drawJepaDiagram(0.5, diagramScale, J, "train", "S I M P L E _ B E G I N N I N G S");
      }

      let time = 0;

      function draw() {
        time += 0.008;
        drawJepa(time);
        requestAnimationFrame(draw);
      }

      draw();
