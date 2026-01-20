import fetch from "node-fetch";

const urls = [
    "https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80"
];

async function verifyUrls() {
    for (const url of urls) {
        try {
            const res = await fetch(url, { method: "HEAD" });
            console.log(`${res.status === 200 ? "✅" : "❌"} ${res.status}: ${url}`);
        } catch (e) {
            console.log(`❌ ERROR: ${url} (${e.message})`);
        }
    }
}

verifyUrls();
