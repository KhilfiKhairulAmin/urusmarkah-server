const aplikasi = require("./aplikasi")

// Penetapan port pendengaran server
const port = 5000;

aplikasi.listen(port, () => {
    console.log(`Mendengar pada port:${port}`)
});