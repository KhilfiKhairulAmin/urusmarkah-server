const kendaliRalatMongoose = require("./kendaliRalatMongoose");
const Ralat = require("./Ralat");

const validasiEmel = (emel) => {
    
        if (!emel.includes('@')) throw new Ralat('emel', 'Format emel tidak sah');

        const ujiEmel = emel;

        const [pertama, terakhir] = ujiEmel.split('@');

        if (!(pertama && terakhir)) throw new Ralat('emel', 'Format emel tidak sah');

        if (emel.length > 255) throw new Ralat('emel', 'Emel tidak boleh melebihi 255 perkataan');

        return emel;
}

const validasiKatalaluan = (katalaluan) => {

        if (!katalaluan) throw new Ralat('katalaluan', 'Katalaluan mesti wujud');

        if (katalaluan.length > 255) throw new Ralat('katalaluan', 'Katalaluan tidak boleh melebihi 255 perkataan');

        return katalaluan;
}

module.exports = {
        validasiEmel,
        validasiKatalaluan
}