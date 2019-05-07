var express = require('express')
var multer = require('multer')
var Docxtemplater = require('docxtemplater');
var fs = require('fs')
var path = require('path');
var JSZip = require('jszip');

const storage = multer.diskStorage({ // notice you are calling the multer.diskStorage() method here, not multer()
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});
const upload = multer({ storage }); //provide the return value from 

var app = express()
app.use('/public', express.static('public'))


app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));


app.post('/upload', upload.single('documentCL'), function (req, res, next) {
  console.log("goos")
  console.log(req.file)
  console.log(req.body)
  generateDoc(req.file.filename, req.body.date, req.body.fName, req.body.lName, req.body.positionRec, req.body.company, req.body.street, req.body.city, req.body.province, req.body.postalCode, req.body.title, req.body.position, res)

})




function generateDoc(f, dat, fnam, lnam, poRec, comp, strt, cit, prov, postC, titl, pos, sender) {


  var content = fs
    .readFileSync(path.resolve(__dirname + '/uploads', f), 'binary');

  var zip = new JSZip(content);

  var doc = new Docxtemplater();
  doc.loadZip(zip);

  //set the templateVariables
  doc.setData({
    day: dat,
    fName: fnam,
    lName: lnam,
    positionRec: poRec,
    company: comp,
    address_street: strt,
    city: cit,
    province: prov,
    postalCode: postC,
    title: titl,
    userposition: pos
  });

  /*
  day
  fName
  lName
  positionRec
  company
  address_street
  city
  province
  postalCode
  title
  userpositon
  */

  try {
    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
    doc.render()
  }
  catch (error) {
    var e = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      properties: error.properties,
    }
    console.log(JSON.stringify({ error: e }));
    // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
    throw error;
  }

  var buf = doc.getZip()
    .generate({ type: 'nodebuffer' });

  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  fs.writeFileSync(path.resolve(__dirname + '/out', f + '_out.docx'), buf);
  sender.download(path.resolve(__dirname + '/out', f + '_out.docx'), function (err, data) {
  });
}

const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));