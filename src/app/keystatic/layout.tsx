import KeystaticApp from "./keystatic";
import "./admin-theme.css";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function Layout() {
  return <KeystaticApp />;
}
