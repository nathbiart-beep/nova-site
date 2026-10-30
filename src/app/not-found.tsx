import Link from "next/link";
import { Analytics } from "@/components/analytics";
import { Star } from "@/components/brand";
import { Footer, Header } from "@/components/layout-parts";

export const metadata = { title: "Page introuvable", robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="contenu" className="section">
        <div className="container narrow center">
          <Star size={80} className="accent" />
          <h1>Cette page s&apos;est perdue en soirée</h1>
          <p className="lead">Elle a dû rentrer trop tard. Reviens à l&apos;accueil ou jette un œil à l&apos;agenda.</p>
          <div className="btn-row center-row">
            <Link className="btn" href="/">Accueil</Link>
            <Link className="btn btn-ghost" href="/agenda">Agenda</Link>
          </div>
        </div>
      </main>
      <Footer />
      <Analytics notFound />
    </>
  );
}
