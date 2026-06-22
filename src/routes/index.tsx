import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StoreProvider } from "@/lib/g3d/store";
import { Dock, Header } from "@/components/g3d/Shell";
import { PainelTab } from "@/components/g3d/tabs/Painel";
import { ProducaoTab } from "@/components/g3d/tabs/Producao";
import { ClientesTab } from "@/components/g3d/tabs/Clientes";
import { ERPTab } from "@/components/g3d/tabs/ERP";
import { CustosTab } from "@/components/g3d/tabs/Custos";
import { AjustesTab } from "@/components/g3d/tabs/Ajustes";
import { VitrineTab, ShowcaseView } from "@/components/g3d/tabs/Vitrine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gestão 3D — Ateliê 3D Hub" },
      { name: "description", content: "Sistema completo de gestão para ateliês de impressão 3D: produção, CRM, custos, integrações e vitrine." },
      { property: "og:title", content: "Gestão 3D — Ateliê 3D Hub" },
      { property: "og:description", content: "Sistema completo de gestão para ateliês de impressão 3D." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <StoreProvider>
      <Gestao3DApp />
    </StoreProvider>
  );
}

function Gestao3DApp() {
  const [tab, setTab] = useState(0);
  const [blink, setBlink] = useState(false);
  const [showcase, setShowcase] = useState(false);

  if (showcase) return <ShowcaseView onExit={() => setShowcase(false)} />;

  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--brand-bg)" }}>
      <Header blink={blink} />
      <main key={tab} className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 animate-fade-up">
        {tab === 0 && <PainelTab />}
        {tab === 1 && <ProducaoTab />}
        {tab === 2 && <ClientesTab />}
        {tab === 3 && <ERPTab onPendingFound={() => { setBlink(true); setTimeout(() => setBlink(false), 4000); }} />}
        {tab === 4 && <CustosTab />}
        {tab === 5 && <AjustesTab />}
        {tab === 6 && <VitrineTab onShowcase={() => setShowcase(true)} />}
      </main>
      <Dock current={tab} onChange={setTab} blink={blink} />
    </div>
  );
}
