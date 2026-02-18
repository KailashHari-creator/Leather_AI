// const express = require('express');
// const fs = require('fs');
// const path = require('path');
// const bodyParser = require('body-parser');
// const app = express();
// const http = require('http');
// const { Server } = require("socket.io");

// const PORT = 3000
// const server = http.createServer(app); // 3. Wrap Express
// const io = new Server(server); // 4. Attach Socket.io to the HTTP server
// // Fixed Capture Logic: Reads root of /captures
// function getCaptureData() {
//     if (!fs.existsSync(captureDir)) return [];
//     return fs.readdirSync(captureDir)
//         .filter(f => f.endsWith('.png'))
//         .map(f => ({
//             name: f,
//             path: `/captures/${f}`,
//             time: fs.statSync(path.join(captureDir, f)).mtimeMs
//         })).sort((a, b) => b.time - a.time);
// }

// // Socket Logic
// io.on('connection', (socket) => {
//     console.log('Admin Connected');
//     // Send initial state immediately on connect
//     socket.emit('init_data', {
//         captures: getCaptureData(),
//         logs: logs
//     });
// });

// app.post('/upload', (req, res) => {
//     const fileName = `SHARD_${Date.now()}.png`;
//     const filePath = path.join(captureDir, fileName);
//     const base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");

//     fs.writeFile(filePath, base64Data, 'base64', (err) => {
//         if (err) return res.status(500).json({status:"ERROR"});
        
//         const newLog = `[CAPTURE] ${fileName} saved.`;
//         logs.push(newLog);
//         if(logs.length > 15) logs.shift();

//         // Broadcast to all admins
//         const allCaptures = getCaptureData();
//         io.emit('update', {
//             newCapture: { name: fileName, path: `/captures/${fileName}` },
//             allCaptures: allCaptures,
//             log: newLog
//         });

//         res.json({ status: "SUCCESS" });
//     });
// });

// app.use(express.static(__dirname));

// // Create 'captures' directory if it doesn't exist
// const captureDir = path.join(__dirname, 'captures');
// if (!fs.existsSync(captureDir)) {
//     fs.mkdirSync(captureDir);
// }

// // Increase limit to handle high-res images
// app.use(bodyParser.json({ limit: '10mb' }));
// app.use(express.static('public'));

// // Route to render the main page
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'homepage.html'));
// });
// app.get('/data',(req, res) => {
//     res.sendFile(path.join(__dirname, 'data_sourcing.html'));
// });

// app.get('/admin',(req,res) => {
//     res.sendFile(path.join(__dirname, 'admin_dashboard.html'));
// });
// // Change 1: Update the capture endpoint to read from the root 'captures' folder 
// // as specified in your upload route
// app.get('/api/captures', (req, res) => {
//     const dir = path.join(__dirname, 'captures');
//     if (!fs.existsSync(dir)) return res.json([]);

//     const files = fs.readdirSync(dir)
//         .filter(f => f.endsWith('.png'))
//         .map(f => ({
//             name: f,
//             path: `/captures/${f}`,
//             time: fs.statSync(path.join(dir, f)).mtimeMs
//         }))
//         .sort((a, b) => b.time - a.time);

//     res.json(files);
// });
// // Ensure this array is at the TOP of your server.js
// let SYSTEM_LOGS = ["SYSTEM_INITIALIZED", "AWAITING_UPLINK..."];

// function syslog(msg) {
//     const entry = `${new Date().toLocaleTimeString()} | ${msg}`;
//     SYSTEM_LOGS.push(entry);
//     if (SYSTEM_LOGS.length > 50) SYSTEM_LOGS.shift(); // Keep last 50 logs
//     console.log(entry);
// }

// // Ensure these routes are defined BEFORE app.listen
// app.get('/api/logs', (req, res) => {
//     res.json(SYSTEM_LOGS);
// });

// app.get('/api/logs', (req, res) => {
//     res.json(SYSTEM_LOGS); // Returns JSON array
// });

// app.get('/api/captures', (req, res) => {
//     if (!fs.existsSync(captureDir)) return res.json([]);
    
//     const files = fs.readdirSync(captureDir)
//         .filter(f => f.endsWith('.png'))
//         .map(f => ({
//             name: f,
//             path: `/captures/${f}`,
//             time: fs.statSync(path.join(captureDir, f)).mtimeMs
//         }))
//         .sort((a, b) => b.time - a.time);
    
//     res.json(files); // Returns JSON array
// });

// // app.post('/upload', (req, res) => {
// //     const imageData = req.body.image;
// //     if (!imageData) return res.status(400).json({ status: "ERROR", msg: "NO_DATA" });

// //     const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
// //     const fileName = `SHARD_${Date.now()}.png`;
// //     const filePath = path.join(captureDir, fileName);

// //     fs.writeFile(filePath, base64Data, 'base64', (err) => {
// //         if (err) {
// //             syslog(`SAVE_FAIL: ${fileName}`);
// //             return res.status(500).json({ status: "ERROR" });
// //         }
// //         syslog(`DATA_SHARD_SAVED: ${fileName}`);
// //         res.json({ status: "SUCCESS", path: `/captures/${fileName}` });
// //     });
// // });

// app.listen(PORT, () => {
//     console.log(`
//     SYSTEM_ONLINE: http://localhost:${PORT}
//     VAULT_PATH: ${captureDir}
//     `);
// });
const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');           // Built-in
const { Server } = require("socket.io"); // Run: npm install socket.io

const app = express();
const server = http.createServer(app);  // WRAP EXPRESS
const io = new Server(server);         // ATTACH SOCKETS
const PORT = 3000;
let LAST_USERS = [];
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.static(__dirname));
app.use(express.json({ limit: '10mb' }));
app.use('/captures', express.static(path.join(__dirname, 'captures')));

const captureDir = path.join(__dirname, 'captures');
if (!fs.existsSync(captureDir)) fs.mkdirSync(captureDir);

let SYSTEM_LOGS = [];

function syslog(msg) {
    const entry = { time: new Date().toLocaleTimeString(), msg };
    SYSTEM_LOGS.unshift(entry);
    if (SYSTEM_LOGS.length > 20) SYSTEM_LOGS.pop();
    io.emit('sys_log', entry); 
}

function getCaptures() {
    return fs.readdirSync(captureDir)
        .filter(f => f.endsWith('.png'))
        .map(f => ({
            name: f,
            path: `/captures/${f}`,
            time: fs.statSync(path.join(captureDir, f)).mtimeMs,
            // Random simulation of world coordinates
            lat: (Math.random() * 140 - 70).toFixed(4),
            lng: (Math.random() * 360 - 180).toFixed(4)
        }))
        .sort((a, b) => b.time - a.time);
}

io.on('connection', (socket) => {
    socket.emit('init_sync', {
        captures: getCaptures(),
        logs: SYSTEM_LOGS
    });
});
app.use((req, res, next) => {
    let uid = req.cookies.uid;

    if (!uid) {
        uid = `USER_${Date.now()}_${Math.floor(Math.random()*9999)}`;
        res.cookie('uid', uid, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        });
    }

    const userData = {
        uid,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        agent: req.headers['user-agent'],
        time: new Date().toLocaleString()
    };

    LAST_USERS.unshift(userData);

    // Deduplicate + keep last 5
    LAST_USERS = LAST_USERS.filter(
        (v, i, a) => a.findIndex(t => t.uid === v.uid) === i
    ).slice(0, 5);

    next();
});
app.get('/api/users', (req, res) => {
    res.json(LAST_USERS);
});

app.post('/upload', (req, res) => {
    const fileName = `SHARD_${Date.now()}.png`;
    const filePath = path.join(captureDir, fileName);
    const base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");

    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) return res.status(500).json({status: "ERROR"});
        
        syslog(`IMAGE_CAPTURED: ${fileName}`);
        const all = getCaptures();
        io.emit('update_data', {
            newImage: all[0],
            total: all.length,
            allCaptures: all
        });
        res.json({ status: "SUCCESS" });
    });
});

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin_dashboard.html')));
app.get('/data', (req, res) => res.sendFile(path.join(__dirname, 'data_sourcing.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'homepage.html')));
app.get('/util', (req, res) => res.sendFile(path.join(__dirname, 'utility_funtions.html')));
app.get('/timeline', (req, res) => res.sendFile(path.join(__dirname, 'timeline.html')));
app.get('/users', (req, res) => res.sendFile(path.join(__dirname, 'users.html')));
// START WITH server.listen, NOT app.listen
server.listen(PORT, () => console.log(`SYSTEM_CORE_UP: http://localhost:${PORT}/admin`));