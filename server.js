"本网盘由Fuk_xiexie制作"
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jschardet = require('jschardet');
const iconv = require('iconv-lite');

const app = express();
const port = 25565;	//可更改端口号，如果端口被占用则会报错

app.use(cors());

const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const filenameBuffer = Buffer.from(file.originalname, 'binary');
        const detectedResult = jschardet.detect(filenameBuffer);
        const detectedEncoding = detectedResult.encoding;
        const utf8Filename = iconv.decode(filenameBuffer, detectedEncoding);
        cb(null, utf8Filename);
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));

app.post('/upload', upload.single('file'), (req, res) => {
    res.status(200).send('文件上传成功！');
});

app.get('/fileList', (req, res) => {
    fs.readdir(uploadFolder, (err, files) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.json({ files });
    });
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadFolder, filename);
    res.setHeader('Content-disposition', `attachment; filename="${encodeURI(filename)}"`);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
});

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});
