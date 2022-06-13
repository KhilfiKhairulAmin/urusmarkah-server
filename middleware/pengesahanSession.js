const Session = require("../model/Session");
const kendaliRalatMongoose = require("../util/kendaliRalatMongoose");
const Ralat = require("../util/Ralat");

const pengesahanSession = async (req, res, next) => {
    try {
        const authorization = req.headers['authorization'];

        if (!authorization) throw new Ralat('request.headers', 'Sila muatkan Headers \'Authorization\' dengan "Bearer {session_id}"');

        const type = authorization.split(' ');
        const _id = type[1];

        if (!_id) throw new Ralat('request.headers', 'Sila muatkan ID Session dalam Headers \'Authorization\' (format "Session {session})');

        const session = await Session.findById(_id).populate('peserta');

        if (!session) throw new Ralat('Ralat Kesahan', 'Session tidak sah');

        req.peserta = session.peserta;

        next();
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran headers mengikut format yang betul');
    }
}

module.exports = pengesahanSession