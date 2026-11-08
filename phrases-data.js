// [japanese with 漢字{よみ} furigana, romaji, english, heard?] — heard = staff will say this to you
export const PHRASES = [
  { cat: 'Convenience store', items: [
    ['袋{ふくろ}はいりません。','Fukuro wa irimasen.',"I don't need a bag."],
    ['袋{ふくろ}をください。','Fukuro o kudasai.','A bag, please.'],
    ['温{あたた}めてください。','Atatamete kudasai.','Please heat it up.'],
    ['お箸{はし}をください。','Ohashi o kudasai.','Chopsticks, please.'],
    ['カードで払{はら}えますか？','Kādo de haraemasu ka?','Can I pay by card?'],
    ['レシートはいりません。','Reshīto wa irimasen.',"I don't need the receipt."],
    ['ポイントカードはお持{も}ちですか？','Pointo kādo wa omochi desu ka?','Do you have a point card?',1],
    ['温{あたた}めますか？','Atatamemasu ka?','Shall I heat it up?',1],
    ['いいえ、大丈夫{だいじょうぶ}です。','Iie, daijōbu desu.',"No, I'm fine."],
  ]},
  { cat: 'Restaurant', items: [
    ['何名様{なんめいさま}ですか？','Nanmei-sama desu ka?','How many people?',1],
    ['二人{ふたり}です。','Futari desu.','Two people.'],
    ['すみません！','Sumimasen!','Excuse me! (to call staff)'],
    ['メニューをください。','Menyū o kudasai.','Menu, please.'],
    ['英語{えいご}のメニューはありますか？','Eigo no menyū wa arimasu ka?','Do you have an English menu?'],
    ['おすすめは何{なん}ですか？','Osusume wa nan desu ka?','What do you recommend?'],
    ['これをください。','Kore o kudasai.','This one, please.'],
    ['お水{みず}をください。','Omizu o kudasai.','Water, please.'],
    ['お会計{かいけい}をお願{ねが}いします。','Okaikei o onegaishimasu.','The check, please.'],
    ['ごちそうさまでした。','Gochisōsama deshita.','Thank you for the meal.'],
  ]},
  { cat: 'Greetings & basics', items: [
    ['こんにちは','Konnichiwa','Hello'],
    ['おはようございます','Ohayō gozaimasu','Good morning'],
    ['こんばんは','Konbanwa','Good evening'],
    ['ありがとうございます','Arigatō gozaimasu','Thank you'],
    ['すみません','Sumimasen','Excuse me / Sorry'],
    ['はい / いいえ','Hai / Iie','Yes / No'],
    ['英語{えいご}を話{はな}せますか？','Eigo o hanasemasu ka?','Do you speak English?'],
    ['分{わ}かりません。','Wakarimasen.',"I don't understand."],
    ['もう一度{いちど}お願{ねが}いします。','Mō ichido onegaishimasu.','One more time, please.'],
    ['ゆっくりお願{ねが}いします。','Yukkuri onegaishimasu.','Slowly, please.'],
  ]},
  { cat: 'Directions & transit', items: [
    ['駅{えき}はどこですか？','Eki wa doko desu ka?','Where is the station?'],
    ['トイレはどこですか？','Toire wa doko desu ka?','Where is the restroom?'],
    ['ここに行{い}きたいです。','Koko ni ikitai desu.','I want to go here.'],
    ['この電車{でんしゃ}は新宿{しんじゅく}に行{い}きますか？','Kono densha wa Shinjuku ni ikimasu ka?','Does this train go to Shinjuku?'],
    ['切符{きっぷ}売{う}り場{ば}はどこですか？','Kippu uriba wa doko desu ka?','Where is the ticket office?'],
    ['右{みぎ} / 左{ひだり} / まっすぐ','Migi / Hidari / Massugu','Right / Left / Straight ahead'],
    ['ここで止{と}めてください。','Koko de tomete kudasai.','Please stop here. (taxi)'],
  ]},
  { cat: 'Shopping', items: [
    ['いくらですか？','Ikura desu ka?','How much is it?'],
    ['これを見{み}せてください。','Kore o misete kudasai.','Please show me this.'],
    ['試着{しちゃく}してもいいですか？','Shichaku shite mo ii desu ka?','May I try it on?'],
    ['他{ほか}の色{いろ}はありますか？','Hoka no iro wa arimasu ka?','Do you have other colors?'],
    ['免税{めんぜい}できますか？','Menzei dekimasu ka?','Can I buy this tax-free?'],
    ['見{み}ているだけです。','Mite iru dake desu.',"I'm just looking."],
    ['これにします。','Kore ni shimasu.',"I'll take this."],
  ]},
  { cat: 'Hotel', items: [
    ['チェックインをお願{ねが}いします。','Chekkuin o onegaishimasu.','Check-in, please.'],
    ['予約{よやく}しています。','Yoyaku shite imasu.','I have a reservation.'],
    ['荷物{にもつ}を預{あず}かってもらえますか？','Nimotsu o azukatte moraemasu ka?','Can you hold my luggage?'],
    ['Wi-Fiのパスワードは何{なん}ですか？','Wai-fai no pasuwādo wa nan desu ka?',"What's the Wi-Fi password?"],
    ['チェックアウトは何時{なんじ}ですか？','Chekkuauto wa nanji desu ka?','What time is checkout?'],
    ['部屋{へや}の鍵{かぎ}をなくしました。','Heya no kagi o nakushimashita.','I lost my room key.'],
  ]},
  { cat: 'Emergencies', items: [
    ['助{たす}けて！','Tasukete!','Help!'],
    ['救急車{きゅうきゅうしゃ}を呼{よ}んでください。','Kyūkyūsha o yonde kudasai.','Please call an ambulance.'],
    ['警察{けいさつ}を呼{よ}んでください。','Keisatsu o yonde kudasai.','Please call the police.'],
    ['病院{びょういん}はどこですか？','Byōin wa doko desu ka?','Where is the hospital?'],
    ['気分{きぶん}が悪{わる}いです。','Kibun ga warui desu.','I feel sick.'],
    ['アレルギーがあります。','Arerugī ga arimasu.','I have an allergy.'],
    ['財布{さいふ}をなくしました。','Saifu o nakushimashita.','I lost my wallet.'],
  ]},
  { cat: 'Numbers & prices', items: [
    ['一{いち}・二{に}・三{さん}・四{よん}・五{ご}','Ichi · ni · san · yon · go','1 · 2 · 3 · 4 · 5'],
    ['六{ろく}・七{なな}・八{はち}・九{きゅう}・十{じゅう}','Roku · nana · hachi · kyū · jū','6 · 7 · 8 · 9 · 10'],
    ['百{ひゃく} / 千{せん} / 万{まん}','Hyaku / sen / man','100 / 1,000 / 10,000'],
    ['一{ひと}つ・二{ふた}つ・三{みっ}つ','Hitotsu · futatsu · mittsu','One · two · three (items)'],
    ['五百円{ごひゃくえん}','Gohyaku en','500 yen'],
    ['千円{せんえん}','Sen en','1,000 yen'],
    ['三千五百円{さんぜんごひゃくえん}','Sanzen gohyaku en','3,500 yen'],
  ]},
];

// '漢字{かんじ}です' -> [{t:'漢字', rt:'かんじ'}, {t:'です', rt:''}]
export function furigana(s) {
  const out = [], re = /([\u3005\u4e00-\u9fff]+)\{([^}]+)\}/g;
  let last = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ t: s.slice(last, m.index), rt: '' });
    out.push({ t: m[1], rt: m[2] });
    last = re.lastIndex;
  }
  if (last < s.length) out.push({ t: s.slice(last), rt: '' });
  return out;
}
export const plain = s => s.replace(/\{[^}]+\}/g, '');
