"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ARActionHubProps {
  modelRef: React.RefObject<HTMLElement | null>;
  dishName: string;
  restaurantName: string;
  ingredients?: string[];
}

interface IngredientGameState {
  visible: boolean;
  position: { x: number; y: number };
  ingredient: string;
  caught: boolean;
}

export default function ARActionHub({
  modelRef,
  dishName,
  restaurantName,
  ingredients = []
}: ARActionHubProps) {
  const [showSnapMenu, setShowSnapMenu] = useState(false);
  const [gameMode, setGameMode] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [targetIngredient, setTargetIngredient] = useState("");
  const [floatingIngredients, setFloatingIngredients] = useState<IngredientGameState[]>([]);
  const [snapLoading, setSnapLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const captureSnap = useCallback(async () => {
    if (!modelRef.current) return;

    setSnapLoading(true);

    try {
      const modelViewer = modelRef.current as unknown as {
        toBlob: (options: { idealAspect: boolean }) => Promise<Blob>;
      };

      const blob = await modelViewer.toBlob({ idealAspect: true });

      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.src = url;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(img, 0, 0);

        const watermarkFontSize = Math.max(16, canvas.width / 30);
        ctx.font = `bold ${watermarkFontSize}px "Courier New", monospace`;
        ctx.fillStyle = "rgba(0, 255, 209, 0.8)";
        ctx.textAlign = "right";
        ctx.fillText("Livin3D", canvas.width - 20, canvas.height - 20);

        ctx.font = `${watermarkFontSize * 0.6}px "Courier New", monospace`;
        ctx.fillStyle = "rgba(212, 175, 55, 0.6)";
        ctx.fillText(`${dishName} • ${restaurantName}`, canvas.width - 20, canvas.height - (watermarkFontSize + 10));
      }

      URL.revokeObjectURL(url);

      const finalBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png");
      });

      const file = new File([finalBlob], "dish-snap.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${dishName} at ${restaurantName}`,
          text: `Check out this dish in 3D AR!`
        });
      } else {
        const downloadUrl = URL.createObjectURL(finalBlob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "dish-snap.png";
        link.click();
        URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error("Failed to capture snap:", error);
    } finally {
      setSnapLoading(false);
      setShowSnapMenu(false);
    }
  }, [modelRef, dishName, restaurantName]);

  const startGame = useCallback(() => {
    if (ingredients.length === 0) return;

    const randomIngredient = ingredients[Math.floor(Math.random() * ingredients.length)];
    setTargetIngredient(randomIngredient);
    setGameActive(true);
    setScore(0);

    const interval = setInterval(() => {
      const randomPos = {
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 20
      };
      const randomIng = ingredients[Math.floor(Math.random() * ingredients.length)];

      setFloatingIngredients((prev) => [
        ...prev.slice(-4),
        {
          visible: true,
          position: randomPos,
          ingredient: randomIng,
          caught: false
        }
      ]);
    }, 1500);

setTimeout(() => {
    clearInterval(interval);
    setGameActive(false);
    setFloatingIngredients([]);
  }, 10000);
}, [ingredients]);

  const endGame = useCallback(() => {
    setGameActive(false);
    setFloatingIngredients([]);
  }, []);

  const catchIngredient = useCallback((index: number, ingredient: string) => {
    if (ingredient === targetIngredient) {
      setScore((prev) => prev + 10);
    }

    setFloatingIngredients((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, caught: true } : item
      )
    );

    setTimeout(() => {
      setFloatingIngredients((prev) => prev.filter((_, i) => i !== index));
    }, 300);
  }, [targetIngredient]);

  return (
    <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2">
      {showSnapMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 20 }}
          className="bg-terminal/90 backdrop-blur-md border border-border p-3 rounded-none space-y-2"
        >
          <button
            onClick={captureSnap}
            disabled={snapLoading}
            className="flex items-center gap-2 w-full px-3 py-2 bg-plasma text-void font-ui text-xs tracking-widest uppercase hover:bg-plasma/90 transition-colors disabled:opacity-50"
          >
            {snapLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-void border-t-transparent rounded-full animate-spin" />
                Capturing...
              </>
            ) : (
              <>
                <span>📸</span>
                Capture & Share
              </>
            )}
          </button>
          <p className="text-body-xs font-body text-text-secondary text-center px-2">
            Captures current view with Livin3D watermark
          </p>
        </motion.div>
      )}

      <div className="flex flex-col gap-2">
        <button
          onClick={() => setShowSnapMenu(!showSnapMenu)}
          className="w-12 h-12 bg-void/80 backdrop-blur-md border border-border rounded-full flex items-center justify-center hover:border-plasma transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          title="Foodie Snap"
        >
          <span className="text-xl">📷</span>
        </button>

        <button
          onClick={() => {
            if (gameActive) {
              endGame();
            } else {
              setGameMode(!gameMode);
              if (!gameActive && ingredients.length > 0) {
                startGame();
              }
            }
          }}
          className={`w-12 h-12 backdrop-blur-md border rounded-full flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
            gameActive
              ? "bg-ember/20 border-ember text-ember"
              : "bg-void/80 border-border hover:border-neon-violet text-neon-violet"
          }`}
          title={gameActive ? "End Game" : "Catch the Ingredient"}
        >
          <span className="text-xl">{gameActive ? "⏹️" : "🎮"}</span>
        </button>
      </div>

      <AnimatePresence>
        {gameMode && !gameActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-terminal/90 backdrop-blur-md border border-neon-violet/30 p-3 rounded-none max-w-[200px]"
          >
            <p className="text-body-xs font-body text-text-primary mb-2">
              Catch the Ingredient!
            </p>
            <p className="text-body-xs font-body text-text-secondary mb-3">
              Watch for <span className="text-neon-violet font-mono">{targetIngredient || "?"}</span> and tap it fast!
            </p>
            <button
              onClick={startGame}
              className="w-full py-2 bg-neon-violet text-void font-ui text-xs tracking-widest uppercase hover:bg-neon-violet/90 transition-colors"
            >
              Start Game
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-40"
          >
            <div className="absolute top-20 left-4 bg-void/80 backdrop-blur-md border border-neon-violet/30 px-4 py-2 rounded-none">
              <p className="text-body-xs font-mono text-neon-violet">
                Find: <span className="text-plasma font-bold">{targetIngredient}</span>
              </p>
              <p className="text-body-lg font-mono text-plasma">Score: {score}</p>
            </div>

            {floatingIngredients.map((item, index) => (
              <motion.button
                key={`${item.ingredient}-${index}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: item.caught ? 0 : 1,
                  scale: item.caught ? 0 : 1,
                  y: 0
                }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => catchIngredient(index, item.ingredient)}
                className={`absolute pointer-events-auto px-3 py-1.5 rounded-none font-ui text-xs tracking-widest uppercase border transition-all hover:scale-110 ${
                  item.ingredient === targetIngredient
                    ? "bg-neon-violet/20 border-neon-violet text-neon-violet animate-pulse"
                    : "bg-surface/80 border-border text-text-secondary"
                }`}
                style={{
                  left: `${item.position.x}%`,
                  top: `${item.position.y}%`,
                  transform: "translate(-50%, -50%)"
                }}
              >
                {item.ingredient}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}