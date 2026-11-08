const BASIC = [
  ['あいうえお','アイウエオ','a i u e o','32223','22333'],
  ['かきくけこ','カキクケコ','ka ki ku ke ko','34132','23232'],
  ['さしすせそ','サシスセソ','sa shi su se so','31231','33222'],
  ['たちつてと','タチツテト','ta chi tsu te to','42112','33332'],
  ['なにぬねの','ナニヌネノ','na ni nu ne no','43221','22241'],
  ['はひふへほ','ハヒフヘホ','ha hi fu he ho','31414','22114'],
  ['まみむめも','マミムメモ','ma mi mu me mo','32323','23223'],
  ['や・ゆ・よ','ヤ・ユ・ヨ','ya - yu - yo','3-2-2','2-2-3'],
  ['らりるれろ','ラリルレロ','ra ri ru re ro','22121','22213'],
  ['わ・・・を','ワ・・・ヲ','wa - - - wo','2---3','2---3'],
  ['ん・・・・','ン・・・・','n - - - -','1----','2----'],
];
const DAKU = [
  ['がぎぐげご','ガギグゲゴ','ga gi gu ge go'],
  ['ざじずぜぞ','ザジズゼゾ','za ji zu ze zo'],
  ['だぢづでど','ダヂヅデド','da ji zu de do'],
  ['ばびぶべぼ','バビブベボ','ba bi bu be bo'],
  ['ぱぴぷぺぽ','パピプペポ','pa pi pu pe po'],
];
const COMBO = [
  ['きゃ きゅ きょ','キャ キュ キョ','kya kyu kyo'],
  ['しゃ しゅ しょ','シャ シュ ショ','sha shu sho'],
  ['ちゃ ちゅ ちょ','チャ チュ チョ','cha chu cho'],
  ['にゃ にゅ にょ','ニャ ニュ ニョ','nya nyu nyo'],
  ['ひゃ ひゅ ひょ','ヒャ ヒュ ヒョ','hya hyu hyo'],
  ['みゃ みゅ みょ','ミャ ミュ ミョ','mya myu myo'],
  ['りゃ りゅ りょ','リャ リュ リョ','rya ryu ryo'],
  ['ぎゃ ぎゅ ぎょ','ギャ ギュ ギョ','gya gyu gyo'],
  ['じゃ じゅ じょ','ジャ ジュ ジョ','ja ju jo'],
  ['びゃ びゅ びょ','ビャ ビュ ビョ','bya byu byo'],
  ['ぴゃ ぴゅ ぴょ','ピャ ピュ ピョ','pya pyu pyo'],
];
export const ALTS = {
  shi:['si'], chi:['ti'], tsu:['tu'], fu:['hu'], ji:['zi','di'], zu:['du'], wo:['o'], n:['nn'],
  sha:['sya'], shu:['syu'], sho:['syo'], cha:['tya','cya'], chu:['tyu','cyu'], cho:['tyo','cyo'],
  ja:['zya','jya'], ju:['zyu','jyu'], jo:['zyo','jyo'],
};
const SMALL = { 'ゃ':'や','ゅ':'ゆ','ょ':'よ','ャ':'ヤ','ュ':'ユ','ョ':'ヨ' };

export function buildKana() {
  const items = [], byId = {}, strokes = {};
  BASIC.forEach(([h,k,r,sh,sk]) => [...h].forEach((c,i) => { if (c!=='・') { strokes[c]=+sh[i]; strokes[k[i]]=+sk[i]; } }));
  const count = s => [...s].reduce((n,c) => {
    c = SMALL[c] || c;
    const [base, mark] = [...c.normalize('NFD')];
    return n + (strokes[base]||0) + (mark==='\u3099' ? 2 : mark==='\u309A' ? 1 : 0);
  }, 0);
  const sections = { h: [], k: [] };
  const add = (title, set, rows, cols, split) => {
    ['h','k'].forEach(script => {
      const cells = [];
      rows.forEach(row => {
        const chars = split ? row[script==='h'?0:1].split(' ') : [...row[script==='h'?0:1]];
        const roms = row[2].split(' ');
        chars.forEach((ch,i) => {
          if (ch==='・') { cells.push(null); return; }
          const id = script + ':' + ch;
          const it = { id, ch, r: roms[i], script, set, strokes: count(ch) };
          items.push(it); byId[id] = it; cells.push(it);
        });
      });
      sections[script].push({ title, set, cols, cells });
    });
  };
  add('Basic · gojūon', 'basic', BASIC, 5, false);
  add('Dakuten · handakuten', 'dakuten', DAKU, 5, false);
  add('Combinations · yōon', 'combo', COMBO, 3, true);
  return { items, byId, sections, alts: ALTS };
}
