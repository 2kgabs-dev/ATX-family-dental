// Configuração do Remotion Studio / CLI (npx remotion studio).
// @remotion/transitions 4.0.534: o build ESM embute react-dom 19 por engano e quebra com React 18;
// usamos o build CommonJS do mesmo pacote. Mesma correção de render.mjs. Corrigido na 4.0.535.
import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.overrideWebpackConfig((c) => ({
  ...c,
  resolve: {
    ...c.resolve,
    alias: { ...((c.resolve?.alias as Record<string, string>) || {}), "@remotion/transitions$": path.resolve("node_modules/@remotion/transitions/dist/index.js") },
  },
}));
