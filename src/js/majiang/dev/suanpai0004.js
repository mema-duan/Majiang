/*
 *  Majiang.SuanPai
 */
"use strict";

const Majiang = {
    Shan:   require('../shan'),
};

module.exports = class SuanPai {

constructor(hongpai) {

    this._paishu = {
        m: [0,4,4,4,4,4,4,4,4,4],
        p: [0,4,4,4,4,4,4,4,4,4],
        s: [0,4,4,4,4,4,4,4,4,4],
        z: [0,4,4,4,4,4,4,4]
    };
    if (hongpai) {
        this._paishu.m[0] = hongpai.m;
        this._paishu.p[0] = hongpai.p;
        this._paishu.s[0] = hongpai.s;
    }
    this._zhuangfeng = 0;
    this._menfeng    = 0;
    this._baopai     = [];
}

diaopai(p) {
    this._paishu[p[0]][p[1]]--;
    if (p[1] == 0) this._paishu[p[0]][5]--;
}

paishu(p) {
    return (p[1] == 5) ? this._paishu[p[0]][5] - this._paishu[p[0]][0]
                       : this._paishu[p[0]][p[1]];
}

qipai(qipai, menfeng) {

    this._zhuangfeng = qipai.zhuangfeng;
    this._menfeng    = menfeng;
    this._baopai     = [ qipai.baopai ];
    this.diaopai(qipai.baopai);

    let paistr = qipai.shoupai[menfeng];
    for (let suitstr of paistr.match(/[mpsz]\d[\d\+\=\-]*/g)) {
        let s = suitstr[0];
        for (let n of suitstr.match(/\d/g)) {
            this.diaopai(s+n);
        }
    }
}

zimo(zimo) {
    if (zimo.l == this._menfeng) this.diaopai(zimo.p);
}

dapai(dapai) {
    if (dapai.l != this._menfeng) this.diaopai(dapai.p);
}

fulou(fulou) {
    if (fulou.l != this._menfeng) {
        let s = fulou.m[0];
        for (let n of fulou.m.match(/\d(?![\+\=\-])/g)) {
            this.diaopai(s+n);
        }
    }
}

gang(gang) {
    if (gang.l != this._menfeng) {
        if (gang.m.match(/^[mpsz]\d{4}$/)) {
            let s = gang.m[0];
            for (let n of gang.m.match(/\d/g)) {
                this.diaopai(s+n);
            }
        }
        else {
            let s = gang.m[0], n = gang.m.substr(-1);
            this.diaopai(s+n);
        }
    }
}

kaigang(kaigang) {
    this._baopai.push(kaigang.baopai);
    this.diaopai(kaigang.baopai);
}

paijia(p) {

    const weight = (s, n) => {
        if (n < 1 || 9 < n) return 0;
        let rv = 1;
        for (let baopai of this._baopai) {
            if (s+n == Majiang.Shan.zhenbaopai(baopai)) rv *= 2;
        }
        return rv;;
    }

    let rv;
    let [s, n] = p; n = +n || 5;
    const min = Math.min, max = Math.max, paishu = this._paishu[s];

    if (s == 'z') {
        rv = paishu[n] * weight(s, n);
        if (n == this._zhuangfeng + 1) rv *= 2;
        if (n == this._menfeng + 1)    rv *= 2;
        if (5 <= n && n <= 7)          rv *= 2;
    }
    else {
        let left   = (1 <= n-2)             ? min(paishu[n-2], paishu[n-1]) : 0;
        let center = (1 <= n-1 && n+1 <= 9) ? min(paishu[n-1], paishu[n+1]) : 0;
        let right  =             (n+2 <= 9) ? min(paishu[n+1], paishu[n+2]) : 0;

        let n_pai = [
            left,
            max(left, center),
            paishu[n],
            max(center, right),
            right
        ];
        rv = n_pai[0] * weight(s, n-2)
           + n_pai[1] * weight(s, n-1)
           + n_pai[2] * weight(s, n)
           + n_pai[3] * weight(s, n+1)
           + n_pai[4] * weight(s, n+2);
        rv += ! paishu[0] ? 0
            : n == 7      ? min(paishu[0], n_pai[0]) * weight(s, n-2)
            : n == 6      ? min(paishu[0], n_pai[1]) * weight(s, n-1)
            : n == 5      ? min(paishu[0], n_pai[2]) * weight(s, n)
            : n == 4      ? min(paishu[0], n_pai[3]) * weight(s, n+1)
            : n == 3      ? min(paishu[0], n_pai[4]) * weight(s, n+2)
            :               0;
        if (p[1] == '0') rv *= 2;
    }
    rv *= weight(s, n);

    return rv;
}

paijia_all() {
    let paijia = {};
    for (let s of ['m','p','s','z']) {
        paijia[s] = [];
        for (let n of (s == 'z' ? [1,2,3,4,5,6,7] : [0,1,2,3,4,5,6,7,8,9])) {
            paijia[s][n] = this.paijia(s+n);
        }
    }
    return paijia;
}

}
