const path = require('path');
//const { promisify } = require("util");
const pdf2img = require('pdf2img-lambda-friendly');

//const convert_pr = promisify(pdf2img.convert);
function convert_pr(File) {
  return new Promise(function(resolve, reject) {
    pdf2img.convert(File, function(err, info) {
      if (err) reject(err); else resolve(info);
    })
  });
}

async function PDF2Images(PDFFile, TempDir) {

  pdf2img.setOptions({
    //type: 'png',                                // png or jpg, default jpg
    //density: 600,                               // default 600
    outputdir: TempDir,
    outputname: path.basename(PDFFile, path.extname(PDFFile))
  });

  let info = await convert_pr(PDFFile);
  //console.log(info);

  let res = [];
  for (let i in info.message) res.push(info.message[i].path);
  //console.log(res);
  return res;

}

module.exports = PDF2Images;
