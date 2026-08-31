const http = require("http");
const WebSocket = require("ws");

const PORT = process.env.PORT || 10000;
const TIKTOK_ID = "margh.90";

let tiktokClient = null;
let reconnectTimer = null;

// ----------------------------------------------------
// HTTP SERVER
// ----------------------------------------------------

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8"
    });

    res.end(JSON.stringify({
        status: "online",
        tiktok: TIKTOK_ID,
        websocket: "active"
    }));
});

// ----------------------------------------------------
// WEBSOCKET SERVER
// ----------------------------------------------------

const wss = new WebSocket.Server({
    server: server
});

function broadcast(data) {
    const message = JSON.stringify(data);

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

wss.on("connection", socket => {

    console.log("🌐 Nuovo client WebSocket collegato");

    socket.send(JSON.stringify({
        type: "status",
        message: "WebSocket collegato",
        tiktok: TIKTOK_ID
    }));

    socket.on("close", () => {
        console.log("🔌 Client WebSocket disconnesso");
    });

    socket.on("error", error => {
        console.log("WebSocket client error:", error.message);
    });
});

// ----------------------------------------------------
// TIKTOK CONNECTION
// ----------------------------------------------------

async function connectTikTok() {

    try {

        console.log(`🔄 Connessione a TikTok LIVE @${TIKTOK_ID}...`);

        // Import dinamico perché piratetok-live-js è ESM
        const module = await import("piratetok-live-js");

        const TikTokLiveClient = module.TikTokLiveClient;
        const EventType = module.EventType;

        tiktokClient = new TikTokLiveClient(TIKTOK_ID);

        // --------------------------------------------
        // CHAT
        // --------------------------------------------

        tiktokClient.on(EventType.chat, data => {

            const username =
                data.user?.uniqueId ||
                data.user?.nickname ||
                "utente";

            const nickname =
                data.user?.nickname ||
                username;

            const message =
                data.content ||
                data.comment ||
                "";

            console.log(`💬 ${username}: ${message}`);

            broadcast({
                type: "chat",
                username: username,
                nickname: nickname,
                message: message,
                timestamp: Date.now()
            });
        });

        // --------------------------------------------
        // LIKE
        // --------------------------------------------

        tiktokClient.on(EventType.like, data => {

            const username =
                data.user?.uniqueId ||
                data.user?.nickname ||
                "utente";

            console.log(`❤️ Like: ${username}`);

            broadcast({
                type: "like",
                username: username,
                likes: data.total || data.likeCount || 1,
                timestamp: Date.now()
            });
        });

        // --------------------------------------------
        // GIFT
        // --------------------------------------------

        tiktokClient.on(EventType.gift, data => {

            const username =
                data.user?.uniqueId ||
                data.user?.nickname ||
                "utente";

            const giftName =
                data.gift?.name ||
                data.giftName ||
                "Gift";

            console.log(`🎁 ${username}: ${giftName}`);

            broadcast({
                type: "gift",
                username: username,
                gift: giftName,
                repeat: data.repeatCount || 1,
                timestamp: Date.now()
            });
        });

        // --------------------------------------------
        // FOLLOW
        // --------------------------------------------

        tiktokClient.on(EventType.follow, data => {

            const username =
                data.user?.uniqueId ||
                data.user?.nickname ||
                "utente";

            console.log(`➕ Follow: ${username}`);

            broadcast({
                type: "follow",
                username: username,
                timestamp: Date.now()
            });
        });

        // --------------------------------------------
        // JOIN
        // --------------------------------------------

        tiktokClient.on(EventType.join, data => {

            const username =
                data.user?.uniqueId ||
                data.user?.nickname ||
                "utente";

            console.log(`👋 Join: ${username}`);

            broadcast({
                type: "join",
                username: username,
                timestamp: Date.now()
            });
        });

        // --------------------------------------------
        // CONNESSIONE
        // --------------------------------------------

        await tiktokClient.connect();

        console.log(`✅ Connesso a TikTok LIVE @${TIKTOK_ID}`);

        broadcast({
            type: "status",
            status: "connected",
            tiktok: TIKTOK_ID,
            timestamp: Date.now()
        });

    } catch (error) {

        console.error("❌ Errore TikTok:", error);

        broadcast({
            type: "status",
            status: "error",
            message: error.message,
            timestamp: Date.now()
        });

        // Riprova dopo 10 secondi
        clearTimeout(reconnectTimer);

        reconnectTimer = setTimeout(() => {
            connectTikTok();
        }, 10000);
    }
}

// ----------------------------------------------------
// START SERVER
// ----------------------------------------------------

server.listen(PORT, "0.0.0.0", () => {

    console.log("----------------------------------------");
    console.log("🚀 SERVER AVVIATO");
    console.log("----------------------------------------");
    console.log(`Porta: ${PORT}`);
    console.log(`TikTok: @${TIKTOK_ID}`);
    console.log("WebSocket: attivo");
    console.log("----------------------------------------");

    connectTikTok();
});
