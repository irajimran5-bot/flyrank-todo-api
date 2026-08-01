## 🕷️ Assignment A5: Ethical Web Scraper & Data Pipeline

A custom Node.js web scraper built to collect, clean, and structure data from practice sites for future RAG / LLM application usage.

### 🌟 Pipeline Features:
- **Ethics Layer:** Checks `robots.txt` and sends a custom `User-Agent` (`FlyRankInternScraper/1.0`).
- **Polite Rate Limiting:** Implements a 1.5-second delay between requests to avoid overloading the target server.
- **Parsing & Cleaning:** Uses `cheerio` to parse HTML, strips invalid characters/currency symbols, and normalizes text.
- **Structured Storage:** Saves sanitized JSON records into `data/output.json`.

### 🏃 How to Run the Scraper:
```bash
node scraper.js

```
