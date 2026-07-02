import "../main";
import { createIcons, icons } from "lucide";
import { escapeHtml } from "../utils/html";

const DOCUMENT_MAP = {
  "aviso-legal": { file: "aviso-legal.md", title: "Aviso Legal" },
  "politica-privacidad": { file: "politica-privacidad.md", title: "Política de Privacidad" },
  "politica-cookies": { file: "politica-cookies.md", title: "Política de Cookies" },
  "terminos-uso": { file: "terminos-uso.md", title: "Términos de Uso" },
  "informacion-ia": { file: "informacion-ia.md", title: "Información sobre Inteligencia Artificial" },
};

function resolveDocument() {
  const match = location.pathname.match(/\/legal\/([^/]+)/);
  if (!match) return null;
  return DOCUMENT_MAP[match[1]] || null;
}

const doc = resolveDocument();
if (!doc) {
  document.getElementById("legal-root").textContent = "Documento no encontrado.";
} else {
  document.title = doc.title;

  fetch(`/legaldocs/${doc.file}`)
    .then((res) => {
      if (!res.ok) throw new Error("Error al cargar el documento");
      return res.text();
    })
    .then((md) => {
      document.getElementById("legal-root").innerHTML = mdToHtml(md);
    })
    .catch((err) => {
      document.getElementById("legal-root").textContent = err.message;
    });
}

function mdToHtml(text) {
  const lines = text.split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trim = line.trim();

    if (trim === "") { i++; continue; }

    if (/^\|[-| :]+\|$/.test(trim)) { i++; continue; }

    if (trim.startsWith("|") && trim.endsWith("|")) {
      const cells = trim.slice(1, -1).split("|").map((c) => escapeHtml(c.trim()));
      out.push("<tr><td>" + cells.join("</td><td>") + "</td></tr>");
      i++;
      continue;
    }

    if (trim.startsWith("- ")) {
      const items = [escapeHtml(trim.slice(2))];
      i++;
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(escapeHtml(lines[i].trim().slice(2)));
        i++;
      }
      out.push("<li>" + items.join("</li><li>") + "</li>");
      continue;
    }

    if (/^\d+\.\s/.test(trim)) {
      const items = [escapeHtml(trim.replace(/^\d+\.\s/, ""))];
      i++;
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(escapeHtml(lines[i].trim().replace(/^\d+\.\s/, "")));
        i++;
      }
      out.push("<li>" + items.join("</li><li>") + "</li>");
      continue;
    }

    if (trim.startsWith("###### ")) { out.push("<h6>" + escapeHtml(trim.slice(7)) + "</h6>"); i++; continue; }
    if (trim.startsWith("##### ")) { out.push("<h5>" + escapeHtml(trim.slice(6)) + "</h5>"); i++; continue; }
    if (trim.startsWith("#### ")) { out.push("<h4>" + escapeHtml(trim.slice(5)) + "</h4>"); i++; continue; }
    if (trim.startsWith("### ")) { out.push("<h3>" + escapeHtml(trim.slice(4)) + "</h3>"); i++; continue; }
    if (trim.startsWith("## ")) { out.push("<h2>" + escapeHtml(trim.slice(3)) + "</h2>"); i++; continue; }
    if (trim.startsWith("# ")) { out.push("<h1>" + escapeHtml(trim.slice(2)) + "</h1>"); i++; continue; }

    out.push("<p>" + escapeHtml(trim) + "</p>");
    i++;
  }

  let html = out.join("\n");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/((?:<tr>.*?<\/tr>\n?)+)/g, "<table><tbody>$1</tbody></table>");
  html = html.replace(/((?:<li>.*?<\/li>\n?)+)/g, "<ul>$1</ul>");

  return html;
}
