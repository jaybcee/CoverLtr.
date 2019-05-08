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

app.get('/howto', (req, res) => res.sendFile(__dirname + '/public/howto.html'));

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));


app.post('/upload', upload.single('documentCL'), function (req, res, next) {
  console.log("goos")
  if (typeof req.body.pdf != undefined)
    var makePDF = true
  else
    var makePDF = false
  console.log(req.file)
  console.log(req.body)
  generateDoc(req.file.filename, req, res)

})




function generateDoc(f, req, res) {


  var content = fs
    .readFileSync(path.resolve(__dirname + '/uploads', f), 'binary');

  var zip = new JSZip(content);

  var doc = new Docxtemplater();
  doc.loadZip(zip);

  //new
  if (req.body.positionBody === "undefined" ||req.body.positionBody === "" || req.body.positionBody === " " )
    var posBody = req.body.position
  else
   var posBody = req.body.positionBody

  //set the templateVariables
  doc.setData({
    day: req.body.date,
    fName: req.body.fName,
    lName: req.body.lName,
    positionRec: req.body.positionRec,
    company: req.body.company,
    address_street: req.body.street,
    city: req.body.city,
    province: req.body.province,
    postalCode: req.body.postalCode,
    title: req.body.title + ".",
    userposition: req.body.position,
    userpositionBody: posBody,
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
  fs.writeFileSync(path.resolve(__dirname + '/out', f + '_' + req.body.company + '_out.docx'), buf);
  res.download(path.resolve(__dirname + '/out', f + '_' + req.body.company + '_out.docx'), function (err, data) {
  });
  console.log("generating DOCX!")
}

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));