const { default: mongoose } = require('mongoose');

const { MONGO_URI } = process.env;

/**
 * Menciptakan hubungan dengan pangkalan data
 * @pangkalan_data Urusmarkah
 */
exports.connect = () => {
    mongoose
        .connect(MONGO_URI)
        .then(() => {
            console.log('Berjaya menghubungkan pangkalan data');
        })
        .catch((ralat) => {
            console.log('Hubungan pangkalan data gagal. Proses dihentikan sekarang...');
            console.error(ralat);
            process.exit(1);
        });
};