// Each phrase: [japanese with 漢字{よみ} furigana, romaji, english, heard?, responses?]
//   heard     = 1 when staff will say this to you ("You'll hear")
//   responses = [[japanese, romaji, english], ...] — replies you can give to a "heard" line,
//               or answers you may get back to a question you ask
const Y = 'はい、お願{ねが}いします。|Hai, onegai shimasu.|Yes, please.';
const NO_THANKS = 'いいえ、大丈夫{だいじょうぶ}です。|Iie, daijōbu desu.|No, thank you.';
const r = (...lines) => lines.map(l => l.split('|'));

export const PHRASES = [
  { cat: 'Convenience store', items: [
    ['袋{ふくろ}はご利用{りよう}ですか？','Fukuro wa go-riyō desu ka?','Would you like a bag?',1, r(Y, NO_THANKS)],
    ['温{あたた}めますか？','Atatamemasu ka?','Would you like it heated?',1, r(
      'はい、温{あたた}めてください。|Hai, atatamete kudasai.|Yes, please heat it.',
      'いいえ、そのままで大丈夫{だいじょうぶ}です。|Iie, sono mama de daijōbu desu.|No, it\'s fine as it is.')],
    ['お箸{はし}はお付{つ}けしますか？','Ohashi wa otsuke shimasu ka?','Would you like chopsticks?',1, r(Y,
      'いいえ、結構{けっこう}です。|Iie, kekkō desu.|No, thank you.')],
    ['スプーンはお付{つ}けしますか？','Supūn wa otsuke shimasu ka?','Would you like a spoon?',1, r(
      'はい、一{ひと}つお願{ねが}いします。|Hai, hitotsu onegai shimasu.|Yes, one please.')],
    ['ポイントカードはお持{も}ちですか？','Pointo kādo wa omochi desu ka?','Do you have a points card?',1, r(
      '持{も}っていません。|Motte imasen.|I don\'t have one.')],
    ['お支払{しはら}い方法{ほうほう}は？','Oshiharai hōhō wa?','How would you like to pay?',1, r(
      'クレジットカードでお願{ねが}いします。|Kurejitto kādo de onegai shimasu.|By credit card, please.',
      'スイカでお願{ねが}いします。|Suika de onegai shimasu.|By Suica, please.',
      '現金{げんきん}でお願{ねが}いします。|Genkin de onegai shimasu.|Cash, please.',
      'アップルペイでお願{ねが}いします。|Appuru Pei de onegai shimasu.|Apple Pay, please.',
      'クレジットカードのタッチ決済{けっさい}でお願{ねが}いします。|Kurejitto kādo no tatchi kessai de onegai shimasu.|Contactless credit card, please.')],
    ['レシートはご利用{りよう}ですか？','Reshīto wa go-riyō desu ka?','Would you like a receipt?',1, r(
      'はい、ください。|Hai, kudasai.|Yes, please.', NO_THANKS)],
    ['年齢確認{ねんれいかくにん}をお願{ねが}いします。','Nenrei kakunin o onegai shimasu.','Please confirm your age.',1, r(
      'はい、わかりました。|Hai, wakarimashita.|Okay, understood.')],
    ['袋{ふくろ}はいりません。','Fukuro wa irimasen.',"I don't need a bag."],
    ['袋{ふくろ}をください。','Fukuro o kudasai.','A bag, please.'],
    ['温{あたた}めてください。','Atatamete kudasai.','Please heat it up.'],
    ['お箸{はし}をください。','Ohashi o kudasai.','Chopsticks, please.'],
    ['カードで払{はら}えますか？','Kādo de haraemasu ka?','Can I pay by card?'],
    ['アップルペイは使{つか}えますか？','Appuru Pei wa tsukaemasu ka?','Can I use Apple Pay?'],
    ['アップルペイでお願{ねが}いします。','Appuru Pei de onegai shimasu.','Apple Pay, please.'],
    ['クレジットカードのタッチ決済{けっさい}でお願{ねが}いします。','Kurejitto kādo no tatchi kessai de onegai shimasu.','Contactless credit card, please. (tap to pay)'],
    ['スイカでお願{ねが}いします。','Suika de onegai shimasu.','By Suica, please.'],
    ['レシートはいりません。','Reshīto wa irimasen.',"I don't need the receipt."],
  ]},
  { cat: 'Restaurant', items: [
    ['何名様{なんめいさま}ですか？','Nanmei-sama desu ka?','How many people?',1, r(
      '二人{ふたり}です。|Futari desu.|Two people.',
      '一人{ひとり}です。|Hitori desu.|One person.')],
    ['ご予約{よやく}はありますか？','Go-yoyaku wa arimasu ka?','Do you have a reservation?',1, r(
      'はい、予約{よやく}しています。|Hai, yoyaku shite imasu.|Yes, I have a reservation.',
      'いいえ、予約{よやく}していません。|Iie, yoyaku shite imasen.|No, I don\'t have one.')],
    ['店内{てんない}でお召{め}し上{あ}がりですか？','Tennai de omeshiagari desu ka?','Will you be dining in?',1, r(
      '店内{てんない}でお願{ねが}いします。|Tennai de onegai shimasu.|For here, please.',
      '持{も}ち帰{かえ}りでお願{ねが}いします。|Mochikaeri de onegai shimasu.|To go, please.')],
    ['ご注文{ちゅうもん}はお決{き}まりですか？','Go-chūmon wa okimari desu ka?','Are you ready to order?',1, r(
      'はい、これをお願{ねが}いします。|Hai, kore o onegai shimasu.|Yes, this one, please.',
      'もう少{すこ}し時間{じかん}をください。|Mō sukoshi jikan o kudasai.|A little more time, please.')],
    ['お飲{の}み物{もの}はいかがですか？','Onomimono wa ikaga desu ka?','Would you like something to drink?',1, r(
      'お水{みず}をお願{ねが}いします。|Omizu o onegai shimasu.|Water, please.',
      'お茶{ちゃ}をお願{ねが}いします。|Ocha o onegai shimasu.|Tea, please.')],
    ['アレルギーはありますか？','Arerugī wa arimasu ka?','Do you have any allergies?',1, r(
      'アレルギーはありません。|Arerugī wa arimasen.|I don\'t have any allergies.',
      '食物{しょくもつ}アレルギーがあります。|Shokumotsu arerugī ga arimasu.|I have a food allergy.')],
    ['お会計{かいけい}はご一緒{いっしょ}ですか？','Okaikei wa go-issho desu ka?','Will you pay together?',1, r(
      '一緒{いっしょ}でお願{ねが}いします。|Issho de onegai shimasu.|Together, please.',
      '別々{べつべつ}でお願{ねが}いします。|Betsubetsu de onegai shimasu.|Separately, please.')],
    ['ラストオーダーですが、追加{ついか}のご注文{ちゅうもん}はありますか？','Rasuto ōdā desu ga, tsuika no go-chūmon wa arimasu ka?',"It's last order. Would you like anything else?",1, r(NO_THANKS)],
    ['すみません！','Sumimasen!','Excuse me! (to call staff)'],
    ['メニューをください。','Menyū o kudasai.','Menu, please.'],
    ['英語{えいご}のメニューはありますか？','Eigo no menyū wa arimasu ka?','Do you have an English menu?'],
    ['おすすめは何{なん}ですか？','Osusume wa nan desu ka?','What do you recommend?'],
    ['これをください。','Kore o kudasai.','This one, please.'],
    ['これを二{ふた}つください。','Kore o futatsu kudasai.','Two of these, please.'],
    ['お水{みず}をください。','Omizu o kudasai.','Water, please.'],
    ['辛{から}いですか？','Karai desu ka?','Is it spicy?',0, r(
      '辛{から}くないです。|Karakunai desu.|It\'s not spicy.',
      '少{すこ}し辛{から}いです。|Sukoshi karai desu.|It\'s a little spicy.')],
    ['豚肉{ぶたにく}は入{はい}っていますか？','Butaniku wa haitte imasu ka?','Does this contain pork?',0, r(
      'はい、入{はい}っています。|Hai, haitte imasu.|Yes, it does.',
      'いいえ、入{はい}っていません。|Iie, haitte imasen.|No, it doesn\'t.')],
    ['豚肉{ぶたにく}は食{た}べません。','Butaniku wa tabemasen.',"I don't eat pork."],
    ['スープにも豚肉{ぶたにく}は使{つか}っていますか？','Sūpu ni mo butaniku wa tsukatte imasu ka?','Is pork also used in the soup?'],
    ['豚肉{ぶたにく}なしでお願{ねが}いします。','Butaniku nashi de onegai shimasu.','Without pork, please.'],
    ['とてもおいしいです！','Totemo oishii desu!',"It's very delicious!"],
    ['お会計{かいけい}をお願{ねが}いします。','Okaikei o onegai shimasu.','The bill, please.'],
    ['ごちそうさまでした。','Gochisōsama deshita.','Thank you for the meal.'],
  ]},
  { cat: 'Shopping', items: [
    ['何{なに}かお探{さが}しですか？','Nanika osagashi desu ka?','Are you looking for something?',1, r(
      '見{み}ているだけです。|Mite iru dake desu.|I\'m just looking.',
      'これを探{さが}しています。|Kore o sagashite imasu.|I\'m looking for this.')],
    ['ご試着{しちゃく}されますか？','Go-shichaku saremasu ka?','Would you like to try it on?',1, r(
      'はい、試着{しちゃく}したいです。|Hai, shichaku shitai desu.|Yes, I\'d like to try it on.', NO_THANKS)],
    ['サイズはいかがですか？','Saizu wa ikaga desu ka?','How is the size?',1, r(
      'ちょうどいいです。|Chōdo ii desu.|It fits perfectly.',
      '少{すこ}し大{おお}きいです。|Sukoshi ōkii desu.|It\'s a little big.',
      '少{すこ}し小{ちい}さいです。|Sukoshi chiisai desu.|It\'s a little small.')],
    ['これはいくらですか？','Kore wa ikura desu ka?','How much is this?'],
    ['これを見{み}せてください。','Kore o misete kudasai.','Please show me this.'],
    ['試着{しちゃく}してもいいですか？','Shichaku shite mo ii desu ka?','May I try it on?'],
    ['他{ほか}の色{いろ}はありますか？','Hoka no iro wa arimasu ka?','Do you have another color?'],
    ['小{ちい}さいサイズはありますか？','Chiisai saizu wa arimasu ka?','Do you have a smaller size?'],
    ['免税{めんぜい}できますか？','Menzei dekimasu ka?','Is tax-free shopping available?'],
    ['パスポートは必要{ひつよう}ですか？','Pasupōto wa hitsuyō desu ka?','Do I need my passport?'],
    ['カードは使{つか}えますか？','Kādo wa tsukaemasu ka?','Can I pay by card?'],
    ['これを買{か}います。','Kore o kaimasu.',"I'll buy this."],
    ['これにします。','Kore ni shimasu.',"I'll take this."],
  ]},
  { cat: 'Trains & buses', items: [
    ['この電車{でんしゃ}は新宿{しんじゅく}に行{い}きますか？','Kono densha wa Shinjuku ni ikimasu ka?','Does this train go to Shinjuku?',0, r(
      'はい、行{い}きます。|Hai, ikimasu.|Yes, it does.',
      'いいえ、行{い}きません。|Iie, ikimasen.|No, it doesn\'t.')],
    ['何番線{なんばんせん}ですか？','Nanban-sen desu ka?','Which platform?'],
    ['乗{の}り換{か}えは必要{ひつよう}ですか？','Norikae wa hitsuyō desu ka?','Do I need to transfer?',0, r(
      '乗{の}り換{か}えは必要{ひつよう}ありません。|Norikae wa hitsuyō arimasen.|No transfer is needed.',
      '乗{の}り換{か}えが必要{ひつよう}です。|Norikae ga hitsuyō desu.|You need to transfer.')],
    ['次{つぎ}の駅{えき}はどこですか？','Tsugi no eki wa doko desu ka?',"What's the next station?"],
    ['このバスは京都駅{きょうとえき}に行{い}きますか？','Kono basu wa Kyōto-eki ni ikimasu ka?','Does this bus go to Kyoto Station?'],
    ['ここで降{お}りればいいですか？','Koko de orireba ii desu ka?','Should I get off here?'],
    ['スイカは使{つか}えますか？','Suika wa tsukaemasu ka?','Can I use Suica?'],
    ['切符{きっぷ}はどこで買{か}えますか？','Kippu wa doko de kaemasu ka?','Where can I buy a ticket?'],
    ['ここで止{と}めてください。','Koko de tomete kudasai.','Please stop here. (taxi)'],
  ]},
  { cat: 'Directions & sightseeing', items: [
    ['トイレはどこですか？','Toire wa doko desu ka?','Where is the restroom?'],
    ['駅{えき}はどこですか？','Eki wa doko desu ka?','Where is the station?'],
    ['ここに行{い}きたいです。','Koko ni ikitai desu.',"I'd like to go here."],
    ['歩{ある}いて行{い}けますか？','Aruite ikemasu ka?','Can I walk there?'],
    ['ここから遠{とお}いですか？','Koko kara tōi desu ka?','Is it far from here?',0, r(
      'すぐそこです。|Sugu soko desu.|It\'s right over there.',
      'ちょっと遠{とお}いです。|Chotto tōi desu.|It\'s a little far.')],
    ['まっすぐ行{い}ってください。','Massugu itte kudasai.','Go straight.',1],
    ['右{みぎ}に曲{ま}がってください。','Migi ni magatte kudasai.','Turn right.',1],
    ['左{ひだり}に曲{ま}がってください。','Hidari ni magatte kudasai.','Turn left.',1],
    ['写真{しゃしん}を撮{と}ってもらえますか？','Shashin o totte moraemasu ka?','Could you take a photo for me?'],
    ['ここで写真{しゃしん}を撮{と}ってもいいですか？','Koko de shashin o totte mo ii desu ka?','May I take photos here?'],
  ]},
  { cat: 'Hotel', items: [
    ['お名前{なまえ}をお願{ねが}いします。','Onamae o onegai shimasu.','Your name, please.',1, r(
      '田中{たなか}です。|Tanaka desu.|I\'m Tanaka. (use your own name)')],
    ['パスポートを見{み}せてください。','Pasupōto o misete kudasai.','Please show your passport.',1, r(
      'はい、どうぞ。|Hai, dōzo.|Here you go.')],
    ['チェックインをお願{ねが}いします。','Chekku-in o onegai shimasu.',"I'd like to check in."],
    ['予約{よやく}しています。','Yoyaku shite imasu.','I have a reservation.'],
    ['荷物{にもつ}を預{あず}かってもらえますか？','Nimotsu o azukatte moraemasu ka?','Could you hold my luggage?'],
    ['チェックアウトは何時{なんじ}ですか？','Chekku-auto wa nanji desu ka?','What time is checkout?'],
    ['Wi-Fiのパスワードは何{なん}ですか？','Waifai no pasuwādo wa nan desu ka?',"What's the Wi-Fi password?"],
    ['タオルをもう一枚{いちまい}いただけますか？','Taoru o mō ichimai itadakemasu ka?','Could I have another towel?'],
    ['部屋{へや}の鍵{かぎ}をなくしました。','Heya no kagi o nakushimashita.','I lost my room key.'],
  ]},
  { cat: 'Greetings & basics', items: [
    ['こんにちは','Konnichiwa','Hello'],
    ['おはようございます','Ohayō gozaimasu','Good morning'],
    ['こんばんは','Konbanwa','Good evening'],
    ['すみません。','Sumimasen.','Excuse me / Sorry.'],
    ['ありがとうございます。','Arigatō gozaimasu.','Thank you.'],
    ['お願{ねが}いします。','Onegai shimasu.','Please.'],
    ['大丈夫{だいじょうぶ}です。','Daijōbu desu.',"It's okay / I'm fine."],
    ['はい / いいえ','Hai / Iie','Yes / No'],
    ['わかりません。','Wakarimasen.',"I don't understand."],
    ['もう一度{いちど}お願{ねが}いします。','Mō ichido onegai shimasu.','One more time, please.'],
    ['ゆっくり話{はな}してください。','Yukkuri hanashite kudasai.','Please speak slowly.'],
    ['英語{えいご}を話{はな}せますか？','Eigo o hanasemasu ka?','Can you speak English?'],
    ['日本語{にほんご}は少{すこ}しだけ話{はな}せます。','Nihongo wa sukoshi dake hanasemasu.','I only speak a little Japanese.'],
    ['これは何{なん}ですか？','Kore wa nan desu ka?','What is this?'],
    ['ちょっと待{ま}ってください。','Chotto matte kudasai.','Please wait a moment.'],
  ]},
  { cat: 'Emergencies', items: [
    ['助{たす}けてください。','Tasukete kudasai.','Please help me.'],
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
    ['十一{じゅういち}・十二{じゅうに}・十三{じゅうさん}・十四{じゅうよん}・十五{じゅうご}','Jūichi · jūni · jūsan · jūyon · jūgo','11 · 12 · 13 · 14 · 15'],
    ['十六{じゅうろく}・十七{じゅうなな}・十八{じゅうはち}・十九{じゅうきゅう}','Jūroku · jūnana · jūhachi · jūkyū','16 · 17 · 18 · 19'],
    ['二十{にじゅう}・二十一{にじゅういち}・二十二{にじゅうに}・二十三{にじゅうさん}・二十四{にじゅうよん}','Nijū · nijūichi · nijūni · nijūsan · nijūyon','20 · 21 · 22 · 23 · 24'],
    ['二十五{にじゅうご}・二十六{にじゅうろく}・二十七{にじゅうなな}・二十八{にじゅうはち}・二十九{にじゅうきゅう}','Nijūgo · nijūroku · nijūnana · nijūhachi · nijūkyū','25 · 26 · 27 · 28 · 29'],
    ['三十{さんじゅう}・四十{よんじゅう}・五十{ごじゅう}・六十{ろくじゅう}・七十{ななじゅう}','Sanjū · yonjū · gojū · rokujū · nanajū','30 · 40 · 50 · 60 · 70'],
    ['八十{はちじゅう}・九十{きゅうじゅう}・百{ひゃく}・百一{ひゃくいち}','Hachijū · kyūjū · hyaku · hyakuichi','80 · 90 · 100 · 101'],
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
