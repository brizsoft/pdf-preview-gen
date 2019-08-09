const path = require('path');
const pdf = require('pdf-poppler');


async function PDF2Images(PDFFile, TempDir) {

    let opts = {
      format: 'jpeg',
      out_dir: TempDir, 
      out_prefix: path.basename(PDFFile, path.extname(PDFFile)),
      page: null
    }

    const info = await pdf.info(PDFFile);
    await pdf.convert(PDFFile, opts);

    let res = [];
    for (let i = 1; i <= info.pages; i++) res.push(path.join(opts.out_dir, opts.out_prefix + '-' + String(i) + '.jpg'));
    //console.log(res);
    return res;
}

module.exports = PDF2Images;
