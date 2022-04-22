const aplikasi = require("./aplikasi")

// Penetapan port pendengaran server
const { API_PORT } = process.env;

aplikasi.listen(API_PORT, () => {
    console.log(`Mendengar pada port:${API_PORT}`)
});