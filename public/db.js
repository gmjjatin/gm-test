const initSqlJs = require('sql.js/dist/sql-wasm.js');
var fs = require("fs");

var path = require('path');
const crypto = require('crypto');
const os = require('os');
const algorithm = 'aes-256-ctr';
const secretKey = '16d56cf4e0dd9bb36fbcc36834f60jqe';
const iv = crypto.randomBytes(16);
var filebuffer = null;
let dir = path.join(os.homedir(), 'grumpyapp');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
var db = null;
const filepath = path.join(os.homedir(), 'grumpyapp', 'wifi.sqlite')

try {
    filebuffer = fs.readFileSync(filepath);
} catch (e) {
    initSqlJs().then(function(SQL){
        // Load the db
        db = new SQL.Database();
        try {
            db.run("CREATE TABLE wifi (ssid TEXT UNIQUE, pwd TEXT)");
        } catch (e) {
            console.log(e);
        }
        fs.writeFileSync(filepath,  Buffer.from(db.export()));
        filebuffer = fs.readFileSync(filepath);
      });
    
   
}

if (filebuffer != null) {
    initSqlJs().then(function(SQL){
        // Load the db
         db = new SQL.Database(filebuffer);
});
}
const encrypt = (text) => {

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return JSON.stringify({
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    });

};

const decrypt = (hash) => {
   
    hash = JSON.parse(hash);
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
    return decrpyted.toString();
};

const saveSSID = function(ssid,pwd) {
    
    db.run("INSERT OR REPLACE INTO wifi VALUES ('" + ssid + "','"+encrypt(pwd)+"')");
    fs.writeFileSync(filepath,  Buffer.from(db.export()));
};

const fetchSSID = function(event,ssid) {
    let returnObj = null;
    db.each("SELECT * FROM wifi where ssid = '"+ssid+"'", function(row) {
        if(row.ssid!= null && row.pwd!=null) {
            returnObj =  {ssid:row.ssid,pwd:decrypt(row.pwd)};
        }
    });
    event.reply('fetch_saved_ssid_pwd', returnObj);
};



module.exports = {
    saveSSID,
    fetchSSID
};