import type { Metadata } from "next";
import Link from "next/link";
import { getEvents } from "@/lib/content";
import { villeList } from "@/lib/site";
import { EmptyAgenda, EventRow } from "@/components/cards";
import { Breadcrumbs, PageHero } from "@/components/layout-parts";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Agenda des soirées étudiantes à Bruxelles, Namur et Louvain-la-Neuve",
  description:
    "L'agenda des soirées étudiantes de la semaine : TD, soirées de cercles, guindailles et grands événements à Bruxelles, Namur et Louvain-la-Neuve.",
  alternates: { canonical: "/agenda" },
};

export default async function AgendaPage() {
  const events = await getEvents({ upcomingOnly: true });
  return (
    <>
      <PageHero
        eyebrow="Agenda"
        title="Les soirées étudiantes à venir"
        intro="TD, soirées de cercles, guindailles et grands rendez-vous à Bruxelles, Namur et Louvain-la-Neuve. Mis à jour chaque semaine par l'équipe NOVA."
      >
        <div className="chip-row">
          {villeList.map((v) => (
            <Link key={v.slug} className="chip" href={`/villes/${v.slug}`}>
              {v.name}
            </Link>
          ))}
        </div>
      </PageHero>
      <section className="section">
        <div className="container">
          <Breadcrumbs items={[{ name: "Agenda" }]} />
          {events.length ? (
            <div className="event-list">
              {events.map((e) => (
                <EventRow key={e.slug} e={e} />
              ))}
            </div>
          ) : (
            <EmptyAgenda />
          )}
        </div>
      </section>
    </>
  );
}
