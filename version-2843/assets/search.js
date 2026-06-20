import { catalog } from "./catalog.js";

const params = new URLSearchParams(window.location.search);
const query = (params.get("q") || "").trim();
const title = document.querySelector(".search-query-title");
const grid = document.querySelector(".search-results");
const input = document.querySelector(".search-page-input");

if (input) input.value = query;
if (title) title.textContent = query ? `“${query}” 的搜索结果` : "影片搜索";

const words = query.toLowerCase().split(/\s+/).filter(Boolean);
const results = words.length
  ? catalog.filter((item) => words.every((word) => buildText(item).includes(word)))
  : catalog.slice(0, 80);

render(results);

function buildText(item) {
  return [item.title, item.region, item.type, item.genre, item.tags, item.line]
    .join(" ")
    .toLowerCase();
}

function render(items) {
  if (!grid) return;
  grid.textContent = "";
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "没有找到匹配内容，可以换一个关键词继续搜索。";
    grid.appendChild(empty);
    return;
  }
  items.slice(0, 240).forEach((item) => {
    const article = document.createElement("article");
    article.className = "movie-card";
    article.dataset.title = item.title;
    article.dataset.year = item.year;
    article.dataset.score = item.score;
    article.dataset.region = item.region;
    article.dataset.genre = item.genre;
    article.innerHTML = `
      <a class="poster-frame" href="detail/${item.id}.html" aria-label="${escapeHtml(item.title)}">
        <img src="${item.image}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.style.display='none'">
        <span class="score-badge">${escapeHtml(item.rating)}</span>
      </a>
      <div class="card-info">
        <h3><a href="detail/${item.id}.html">${escapeHtml(item.title)}</a></h3>
        <p>${escapeHtml(item.line)}</p>
        <div class="meta-row">
          <span>${escapeHtml(item.year)}</span>
          <span>${escapeHtml(item.region)}</span>
          <a href="categories/${item.category}.html">${escapeHtml(item.categoryName)}</a>
        </div>
      </div>
    `;
    grid.appendChild(article);
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
