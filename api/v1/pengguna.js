const express = require('express'); // Modul Express digunakan untuk mencipta server HTTP dan API
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Pengguna = require('../../model/Pengguna'); // Modul Mongoose digunakan untuk menggunakan pangkalan data MongoDB
const pengesahan = require('../../middleware/pengesahan')
require('../../konfig/pangkalan_data').connect();


const cookieParser = require('cookie-parser');


const router = express.Router(); // Router Express digunakan untuk mengendalikan laluan pesanan (request route) oleh pengguna

const janaIdSession = (kunci_unik) => {
    const random = crypto.randomInt(1,100);
    return crypto.createHash('sha256').update(kunci_unik + random, 'utf8').digest('hex');
}


/*  GET semua pelanggan

*/
router.get('/semua', async (req, res) => {
    const koleksi = await Pengguna.find({});
    res.status(200).send(koleksi);
});

/*  GET pelanggan

*/
router.get('/satu/:nama', async (req, res) => {
    const { nama } = req.params;
    if (!nama) return res.status(400).send({ mesej: 'Perlukan nama'}); // Kembalikan mesej ralat
    const carian = { nama: nama };
    const dokumen = await Pengguna.findOne(carian) // Cari 1 dokumen mempunyai nilai `nama` yang sama (===)
    if (!dokumen) return res.status(400).send({ mesej: 'Pengguna tidak wujud'});
    res.status(200).send(dokumen);
})

/*  PUT (kemas kini) pelanggan

*/
router.put('/kemas_kini/:Nama', pengesahan, async (req, res) => {
    try {
        // Dapatkan nilai input
        const { kata_laluan } = req.body;
        const { pengguna } = req;
        const { Nama } = req.params;

        // Memastikan nama adalah sama
        if (pengguna.nama !== Nama) {
            return res.status(403).send({ mesej: 'Aksi tidak dibenarkan', pengguna})
        }

        // Menyulitkan kata laluan
        const kataLaluanDisulit = await bcrypt.hash(kata_laluan, 10);

        const tapisan = { nama: Nama };
        const kemas_kini = { $set : { kata_laluan: kataLaluanDisulit} };

        // Mengemaskini maklumat pengguna
        await Pengguna.findOneAndUpdate(tapisan, kemas_kini, (err, doc) => {
            if (err) throw err;
            doc.mesej = 'Pengguna berjaya dikemaskini';
            return res.status(200).json(doc);
        });

    } catch (err) {
        console.log(err);
    }
})

/* POST cipta akaun pelanggan

*/
router.post('/daftar', async (req, res) => {
    try {
        // Dapatkan nilai input
        const { emel, nama, kata_laluan } = req.body;
        
        // Memastikan nilai tidak kosong
        if (!(emel && nama && kata_laluan)) {
            return res.status(400).send({ mesej: 'Sila lengkapkan butiran anda'});
        }

        // Memastikan emel belum diambil oleh pengguna lain
        const penggunaLama = await Pengguna.findOne({ emel });

        if (penggunaLama) {
            return res.status(409).send({ mesej: 'Emel sudah digunakan'})
        }

        // Menyulitkan kata laluan pengguna supaya tidak boleh dibaca
        const kataLaluanDisulit = await bcrypt.hash(kata_laluan, 10);

        // Mencipta akaun Pengguna menggunakan maklumat pengguna dengan kata laluan yang disulitkan
        const pengguna = await Pengguna.create({
            emel,
            nama,
            kata_laluan: kataLaluanDisulit,
        });

        // Mencipta token baharu untuk pengesahan kebenaran pengguna menggunakan laman sesawang
        const token = jwt.sign(
            { pengguna_id: pengguna._id, emel},
            process.env.TOKEN_KEY,
            {
                expiresIn: '15s'
            }
        );

        // Mengumpukkan nilai token
        pengguna.token = token;

        // Mengembalikan token dan data pengguna
        return res.status(201).json(pengguna);

    } catch (err) {
        // Ralat berlaku
        console.log(err);
    }
});

/* POST log masuk akaun pengguna

*/
router.post('/log_masuk', async (req, res) => {
    try {
        // Dapatkan nilai input
        const { emel, kata_laluan } = req.body;

        // Memastikan input tidak kosong
        if (!(emel && kata_laluan)) {
            return res.status(400).send({ mesej: 'Sila lengkapkan butiran anda' });
        }
        
        // Mencari emel pengguna
        const pengguna = await Pengguna.findOne({ emel });

        // Memastikan pengguna wujud dan kata laluan betul
        if (pengguna && (await bcrypt.compare(kata_laluan, pengguna.kata_laluan))) {

            // Membuat token JWT baharu
            const token = jwt.sign(
                { pengguna_id: pengguna._id, emel, nama: pengguna.nama },
                process.env.TOKEN_KEY,
                {
                    expiresIn: '30s',
                }
            );

            // Mengumpukkan nilai token
            pengguna.token = token;

            // Menghantar response
            return res.status(200).json(pengguna);
        }

        res.status(400).send({ mesej: 'Emel atau kata laluan salah'})
    } catch (err) {
        console.log(err)
    }
});

router.get('/log_masuk', cookieParser(),  async (req, res) => {
    const { session_id } = req.cookies;
    console.log(req.cookies, session_id)
    if (!session_id) return res.status(400).send({ mesej: 'Session dilarang'});
    const session = await pangkalan_data.db().collection('session').findOne({ session_id: session_id});
    const { emel } = req.query;
    const maklumat_pengguna = await pangkalan_data.db().collection('pengguna').findOne({ emel: emel });
    console.log(maklumat_pengguna)
    res.status(200).send(maklumat_pengguna);
})

module.exports = router // Mengeksport router untuk digunakan oleh aplikasi