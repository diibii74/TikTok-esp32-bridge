const http = require("http");
const WebSocket = require("ws");

const PORT = process.env.PORT || 10000;
const TIKTOK_USERNAME = "margh.90";

let tiktokClient = null;

// =====================================================
// HTTP SERVER
// =====================================================

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8"
    });

    res.end(JSON.stringify({
        status: "online",
        tiktok: TIKTOK_USERNAME,
        websocket: "online"
    }));
});


// =====================================================
// WEBSOCKET SERVER
// =====================================================

const wss = new WebSocket.Server({
    server
});

function sendToClients(data) {

    const message = JSON.stringify(data);

    wss.clients.forEach(client => {

        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }

    });
}


wss.on("connection", socket => {

    console.log("🌐 PieHost/client collegato");

    socket.send(JSON.stringify({
        type: "status",
        status: "websocket_connected",
        tiktok: TIKTOK_USERNAME
    }));

    socket.on("close", () => {
        console.log("🔌 Client scollegato");
    });

});


// =====================================================
// TIKTOK
// =====================================================

async function connectTikTok() {

    try {

        console.log("");
        console.log("====================================");
        console.log("🔄 CONNESSIONE TIKTOK");
        console.log(`👤 @${TIKTOK_USERNAME}`);
        console.log("====================================");

        const {
            TikTokLiveClient,
            EventType
        } = await import("piratetok-live-js");


        // -------------------------------------------------
        // CREA CLIENT
        // -------------------------------------------------

        tiktokClient = new TikTokLiveClient(
            TIKTOK_USERNAME
        );


        // =================================================
        // 💬 CHAT
        // =================================================

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
                "";

            console.log(
                `💬 ${nickname}: ${message}`
            );

            sendToClients({
                type: "chat",
                username,
                nickname,
                message,
                timestamp: Date.now()
            });

        });


        // =================================================
        // 👋 JOIN
        // =================================================

        tiktokClient.on(EventType.join, data => {

            const username =
                data.user?.uniqueId ||
                data.user?.nickname ||
                "utente";

            const nickname =
                data.user?.nickname ||
                username;

            console.log(
                `👋 È ENTRATO: ${nickname} (@${username})`
            );

            sendToClients({
                type: "join",
                username,
                nickname,
                message: `${nickname} è entrato nella LIVE`,
                timestamp: Date.now()
            });

        });


        // =================================================
        // ➕ FOLLOW
        // =================================================

        tiktokClient.on(EventType.follow, data => {

            const username =
                data.user?.uniqueId ||
                data.user?.nickname ||
                "utente";

            const nickname =
                data.user?.nickname ||
                username;

            console.log(
                `➕ FOLLOW: ${nickname}`
            );

            sendToClients({
                type: "follow",
                username,
                nickname,
                message: `${nickname} ha iniziato a seguirti`,
                timestamp: Date.now()
            });

        });


        // =================================================
        // 🎁 GIFT
        // =================================================

        tiktokClient.on(EventType.gift, data => {

            const username =
                data.user?.uniqueId ||
                data.user?.nickname ||
                "utente";

            const nickname =
                data.user?.nickname ||
                username;

            const giftName =
                data.gift?.name ||
                "Regalo";

            const repeat =
                data.repeatCount ||
                1;

            console.log(
                `🎁 ${nickname}: ${giftName} x${repeat}`
            );

            sendToClients({
                type: "gift",
                username,
                nickname,
                gift: giftName,
                repeat,
                message: `${nickname} ha inviato ${giftName} x${repeat}`,
                timestamp: Date.now()
            });

        });


        // =================================================
        // 📤 SHARE
        // =================================================

        tiktokClient.on(EventType.share, data => {

            const username =
                data.user?.uniqueId ||
                data.user?.nickname ||
                "utente";

            const nickname =
                data.user?.nickname ||
                username;

            console.log(
                `📤 SHARE: ${nickname}`
            );

            sendToClients({
                type: "share",
                username,
                nickname,
                message: `${nickname} ha condiviso la LIVE`,
                timestamp: Date.now()
            });

        });


        // =================================================
        // 🔴 LIVE TERMINATA
        // =================================================

        if (EventType.liveEnded) {

            tiktokClient.on(
                EventType.liveEnded,
                data => {

                    console.log(
                        "🔴 LA LIVE È TERMINATA"
                    );

                    sendToClients({
                        type: "liveEnded",
                        message: "La LIVE è terminata",
                        timestamp: Date.now()
                    });

                }
            );

        }


        // =================================================
        // CONNESSIONE
        // =================================================

        await tiktokClient.connect();


        console.log("");
        console.log("====================================");
        console.log("✅ TIKTOK CONNESSO");
        console.log(`👤 @${TIKTOK_USERNAME}`);
        console.log("💬 CHAT       ON");
        console.log("👋 JOIN       ON");
        console.log("➕ FOLLOW     ON");
        console.log("🎁 GIFT       ON");
        console.log("📤 SHARE      ON");
        console.log("====================================");
        console.log("");


        sendToClients({
            type: "status",
            status: "tiktok_connected",
            tiktok: TIKTOK_USERNAME,
            timestamp: Date.now()
        });


    } catch (error) {

        console.error("");
        console.error("❌ ERRORE TIKTOK");
        console.error(error);
        console.error("");

        sendToClients({
            type: "status",
            status: "tiktok_error",
            message: error.message,
            timestamp: Date.now()
        });

        console.log(
            "🔄 Nuovo tentativo tra 10 secondi..."
        );

        setTimeout(
            connectTikTok,
            10000
        );

    }

}


// =====================================================
// AVVIO
// =====================================================

server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");
        console.log("🚀 SERVER AVVIATO");
        console.log(`🌐 PORTA: ${PORT}`);
        console.log(`🎵 TIKTOK: @${TIKTOK_USERNAME}`);
        console.log("🔌 WEBSOCKET: ATTIVO");
        console.log("");

        connectTikTok();

    }
);
