import { Analytics } from "@/components/analytics";
import { Footer, Header, JsonLd } from "@/components/layout-parts";
import { SITE_URL, site } from "@/lib/site";

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Nova Student",
  alternateName: ["NOVA", "novastudent.be"],
  url: SITE_URL,
  logo: `${SITE_URL}/logo-nova.png`,
  email: site.email,
  slogan: site.tagline,
  description: site.description,
  areaServed: ["Bruxelles", "Namur", "Louvain-la-Neuve"],
  sameAs: [site.instagram, site.linkedin],
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "Nova Student",
  alternateName: ["NOVA", "novastudent.be"],
  url: SITE_URL,
  inLanguage: "fr-BE",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu">{children}</main>
      <Footer />
      <JsonLd data={organization} />
      <JsonLd data={website} />
      <Analytics />
    </>
  );
}
