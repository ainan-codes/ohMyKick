export type Language = 'en' | 'ml' | 'ar';

export const TRANSLATIONS: Record<Language, Record<string, string | ((...args: any[]) => string)>> = {
  en: {
    welcome: `⚽ *Welcome to OhMyKick!*\n\nPredict every World Cup 2026 match.\nGet your personalised fan poster after each result.\nCompete with fans worldwide.\n\nTakes 2 minutes. Free. No app needed.\n\nFirst — what's your name?`,
    invalid_name: `⚠️ Please enter a valid name (2–40 characters, letters only).\n\nWhat's your name?`,
    greet_name: (name: string) => `Nice to meet you, ${name}! 🙌\n\nWhich country do you support in the World Cup 2026?`,
    choose_country: 'Choose Country',
    photo_prompt: (flag: string, country: string) => `${flag} *${country}* — a fan of champions.\n\n📷 *To add a photo:* Tap the paperclip 📎 or camera icon next to your text input field and upload a photo.\n\nOtherwise, you can skip and add it later!`,
    onboarding_preparing: (name: string, fanId: string, flag: string, country: string, referralCode: string) =>
      `🎉 *Your Fan Passport is being prepared, ${name}!*\n\n` +
      `🆔 Fan ID: \`${fanId}\`\n` +
      `🌍 Team: ${flag} ${country}\n` +
      `⭐ Level: Fan\n\n` +
      `Your referral code: *${referralCode}*\n` +
      `Every friend who joins with your code is on your record.\n\n` +
      `Share this to your WhatsApp Status 👆`,
    predict_now: '⚽ Predict Now',
    invite_friends: '📨 Invite Friends',
    choose_match_prompt: '⚽ Today\'s matches — pick one to predict:',
    choose_match_btn: 'Choose Match',
    predict_next: '⚽ Predict Next Match',
    who_wins: 'Who wins?',
    draw: '🤝 Draw',
    win_selected: (flag: string, team: string) => `${flag} *${team}* to win ✅`,
    score_prompt: (home: string, away: string) =>
      `Now — what's the exact score?\n\n` +
      `Type like this: *2-1*\n` +
      `(${home} goals first, then ${away})\n\n` +
      `Get it exact = *25 points* 🏆\n` +
      `Correct winner only = *10 points*`,
    locked_in: (homeFlag: string, homeTeam: string, homeScore: number, awayScore: number, awayFlag: string, awayTeam: string) =>
      `🔒 *Locked in!*\n\n` +
      `${homeFlag} ${homeTeam} *${homeScore} – ${awayScore}* ${awayFlag} ${awayTeam}\n\n` +
      `Your matchday poster is on its way... 📸`,
    auto_correct_note: (home: number, away: number) => `\n_(Score auto-corrected to ${home}-${away} for a draw)_`,
    invalid_session: '⚠️ Session expired. Send *predict* to start again.',
    invalid_score_format: 'I couldn\'t read that score. Please type like: *2-1*',
    invalid_score_consistency: 'Invalid score for your winner pick.',
    match_not_predictable: '⚠️ That match is no longer available for prediction. Send *predict* to see current matches.',
    already_predicted: (home: number, away: number) =>
      `✅ You've already predicted this match!\n\n` +
      `Your prediction: *${home} – ${away}*\n\n` +
      `Send *predict* to predict another match.`,
    no_matches: '⏳ No matches available for prediction right now.\n\nMatch predictions open a few hours before kickoff. Check back soon!',
    predictions_not_open: (matchName: string, time: string, timeUntil: string) =>
      `⏳ Predictions are not open yet.\n\n` +
      `Next match: *${matchName}*\n` +
      `Kickoff: ${time} (in ${timeUntil})`,
    trouble_start_over: `Having trouble? Let's start over. Send *predict* when you're ready.`,
    invalid_score_retry: (reason: string, home: string, away: string, attempt: number) =>
      `❌ ${reason}\n\n` +
      `Please type the score again like: *2-1*\n` +
      `(${home} goals first, then ${away})\n\n` +
      `Attempt ${attempt}/3`,
  },
  ml: {
    welcome: `⚽ *OhMyKick-ലേക്ക് സ്വാഗതം!*\n\nഎല്ലാ ലോകകപ്പ് 2026 മത്സരങ്ങളും പ്രവചിക്കുക.\nഓരോ ഫലത്തിനും ശേഷം നിങ്ങളുടെ വ്യക്തിഗതമാക്കിയ ഫാൻ പോസ്റ്റർ നേടുക.\nലോകമെമ്പാടുമുള്ള ആരാധകരുമായി മത്സരിക്കുക.\n\n2 മിനിറ്റ് മതി. പൂർണ്ണമായും സൗജന്യം. ആപ്പ് ആവശ്യമില്ല.\n\nആദ്യം — നിങ്ങളുടെ പേരെന്താണ്?`,
    invalid_name: `⚠️ ദയവായി സാധുവായ ഒരു പേര് നൽകുക (2-40 അക്ഷരങ്ങൾ, അക്ഷരങ്ങൾ മാത്രം).\n\nനിങ്ങളുടെ പേരെന്താണ്?`,
    greet_name: (name: string) => `കണ്ടുമുട്ടിയതിൽ സന്തോഷം, ${name}! 🙌\n\nലോകകപ്പ് 2026-ൽ നിങ്ങൾ ഏത് രാജ്യത്തെയാണ് പിന്തുണയ്ക്കുന്നത്?`,
    choose_country: 'രാജ്യം തിരഞ്ഞെടുക്കുക',
    photo_prompt: (flag: string, country: string) => `${flag} *${country}* — ചാമ്പ്യന്മാരുടെ ആരാധകൻ.\n\n📷 *ഫോട്ടോ ചേർക്കാൻ:* മെസ്സേജ് ബോക്സിന് അടുത്തുള്ള പേപ്പർക്ലിപ്പ് 📎 അല്ലെങ്കിൽ ക്യാമറ ചിഹ്നം ടാപ്പ് ചെയ്ത് ഫോട്ടോ സെൻഡ് ചെയ്യുക.\n\nഅല്ലെങ്കിൽ ഇപ്പോൾ ഒഴിവാക്കി പിന്നീട് ചേർക്കാവുന്നതാണ്!`,
    onboarding_preparing: (name: string, fanId: string, flag: string, country: string, referralCode: string) =>
      `🎉 *നിങ്ങളുടെ ഫാൻ പാസ്‌പോർട്ട് തയ്യാറാവുന്നു, ${name}!*\n\n` +
      `🆔 ഫാൻ ഐഡി: \`${fanId}\`\n` +
      `🌍 ടീം: ${flag} ${country}\n` +
      `⭐ ലെവൽ: ഫാൻ\n\n` +
      `നിങ്ങളുടെ റഫറൽ കോഡ്: *${referralCode}*\n` +
      `നിങ്ങളുടെ കോഡ് ഉപയോഗിച്ച് ജോയിൻ ചെയ്യുന്ന ഓരോ സുഹൃത്തും നിങ്ങളുടെ ലിസ്റ്റിൽ വരും.\n\n` +
      `ഇത് നിങ്ങളുടെ വാട്സാപ്പ് സ്റ്റാറ്റസിൽ പങ്കുവെക്കൂ 👆`,
    predict_now: '⚽ പ്രവചിക്കുക',
    invite_friends: '📨 സുഹൃത്തുക്കളെ ക്ഷണിക്കുക',
    choose_match_prompt: '⚽ ഇന്നത്തെ മത്സരങ്ങൾ — പ്രവചിക്കാൻ ഒന്ന് തിരഞ്ഞെടുക്കൂ:',
    choose_match_btn: 'മത്സരം തിരഞ്ഞെടുക്കുക',
    predict_next: '⚽ അടുത്ത മത്സരം പ്രവചിക്കുക',
    who_wins: 'ആര് ജയിക്കും?',
    draw: '🤝 സമനില',
    win_selected: (flag: string, team: string) => `${flag} *${team}* വിജയിക്കും ✅`,
    score_prompt: (home: string, away: string) =>
      `ഇനി — കറക്റ്റ് സ്കോർ എന്തായിരിക്കും?\n\n` +
      `ഇതുപോലെ ടൈപ്പ് ചെയ്യുക: *2-1*\n` +
      `(${home} ഗോളുകൾ ആദ്യം, ശേഷം ${away})\n\n` +
      `കറക്റ്റ് സ്കോർ ആയാൽ = *25 പോയിന്റ്* 🏆\n` +
      `വിജയിയെ മാത്രം പ്രവചിച്ചാൽ = *10 പോയിന്റ്*`,
    locked_in: (homeFlag: string, homeTeam: string, homeScore: number, awayScore: number, awayFlag: string, awayTeam: string) =>
      `🔒 *ലോക്ക് ചെയ്തു!*\n\n` +
      `${homeFlag} ${homeTeam} *${homeScore} – ${awayScore}* ${awayFlag} ${awayTeam}\n\n` +
      `നിങ്ങളുടെ മാച്ച് പോസ്റ്റർ തയ്യാറായിക്കൊണ്ടിരിക്കുന്നു... 📸`,
    auto_correct_note: (home: number, away: number) => `\n_(സമനിലയ്ക്കായി സ്കോർ ${home}-${away} ആയി ക്രമീകരിച്ചു)_`,
    invalid_session: '⚠️ സെഷൻ അവസാനിച്ചു. പ്രവചിക്കാൻ വീണ്ടും *predict* എന്ന് ടൈപ്പ് ചെയ്യുക.',
    invalid_score_format: 'ആ സ്കോർ വായിക്കാൻ പറ്റിയില്ല. ദയവായി ഇതുപോലെ ടൈപ്പ് ചെയ്യുക: *2-1*',
    invalid_score_consistency: 'നിങ്ങൾ തിരഞ്ഞെടുത്ത വിജയിയുമായി ഈ സ്കോർ യോജിക്കുന്നില്ല.',
    match_not_predictable: '⚠️ ഈ മത്സരം ഇപ്പോൾ പ്രവചിക്കാൻ സാധ്യമല്ല. പുതിയ മത്സരങ്ങൾ കാണാൻ *predict* എന്ന് ടൈപ്പ് ചെയ്യുക.',
    already_predicted: (home: number, away: number) =>
      `✅ ഈ മത്സരത്തിനായുള്ള നിങ്ങളുടെ പ്രവചനം രേഖപ്പെടുത്തിയിട്ടുണ്ട്!\n\n` +
      `നിങ്ങളുടെ പ്രവചനം: *${home} – ${away}*\n\n` +
      `മറ്റൊരു മത്സരം പ്രവചിക്കാൻ *predict* എന്ന് ടൈപ്പ് ചെയ്യുക.`,
    no_matches: '⏳ പ്രവചനങ്ങൾക്കായി മത്സരങ്ങളൊന്നും ഇപ്പോൾ ലഭ്യമല്ല. മത്സരം തുടങ്ങുന്നതിന് കുറച്ചു മണിക്കൂർ മുൻപ് പ്രവചനങ്ങൾ ആരംഭിക്കും. വീണ്ടും പരിശോധിക്കുക!',
    predictions_not_open: (matchName: string, time: string, timeUntil: string) =>
      `⏳ പ്രവചനങ്ങൾ ആരംഭിച്ചിട്ടില്ല.\n\n` +
      `അടുത്ത മത്സരം: *${matchName}*\n` +
      `കിക്ക്ഓഫ്: ${time} (ഇനി ${timeUntil} ബാക്കി)`,
    trouble_start_over: `എന്തെങ്കിലും ബുദ്ധിമുട്ടുണ്ടായോ? നമുക്ക് ആദ്യം മുതൽ തുടങ്ങാം. തയ്യാറാകുമ്പോൾ *predict* എന്ന് അയക്കൂ.`,
    invalid_score_retry: (reason: string, home: string, away: string, attempt: number) =>
      `❌ ${reason}\n\n` +
      `ദയവായി സ്കോർ വീണ്ടും ഇതുപോലെ ടൈപ്പ് ചെയ്യുക: *2-1*\n` +
      `(${home} ഗോളുകൾ ആദ്യം, ശേഷം ${away})\n\n` +
      `ശ്രമം ${attempt}/3`,
  },
  ar: {
    welcome: `⚽ *مرحباً بك في OhMyKick!*\n\nتوقع نتائج مباريات كأس العالم 2026.\nاحصل على بوستر المشجعين الخاص بك بعد كل مباراة.\nتنافس مع مشجعين من جميع أنحاء العالم.\n\nيستغرق الأمر دقيقتين فقط. مجاني بالكامل. لا حاجة لتنزيل تطبيق.\n\nأولاً — ما هو اسمك؟`,
    invalid_name: `⚠️ الرجاء إدخال اسم صحيح (من 2 إلى 40 حرفاً، حروف فقط).\n\nما هو اسمك؟`,
    greet_name: (name: string) => `سررت بلقائك يا ${name}! 🙌\n\nما هو المنتخب الذي تشجعه في كأس العالم 2026؟`,
    choose_country: 'اختر المنتخب',
    photo_prompt: (flag: string, country: string) => `${flag} *${country}* — مشجع الأبطال.\n\n📷 *لإضافة صورة:* اضغط على أيقونة المشبك 📎 أو الكاميرا بجوار حقل إدخال الرسالة وأرسل صورة.\n\nوإلا، يمكنك تخطي ذلك وإضافتها لاحقاً!`,
    onboarding_preparing: (name: string, fanId: string, flag: string, country: string, referralCode: string) =>
      `🎉 *جاري إعداد جواز المشجع الخاص بك يا ${name}!*\n\n` +
      `🆔 رقم الهوية: \`${fanId}\`\n` +
      `🌍 المنتخب: {flag} {country}\n` +
      `⭐ المستوى: مشجع\n\n` +
      `رمز الإحالة الخاص بك: *${referralCode}*\n` +
      `كل صديق ينضم باستخدام الرمز الخاص بك سيتم احتسابه لك.\n\n` +
      `شارك هذا في حالة واتساب الخاصة بك 👆`,
    predict_now: '⚽ توقع الآن',
    invite_friends: '📨 دعوة الأصدقاء',
    choose_match_prompt: '⚽ مباريات اليوم — اختر مباراة لتوقعها:',
    choose_match_btn: 'اختر المباراة',
    predict_next: '⚽ توقع المباراة القادمة',
    who_wins: 'من سيفوز؟',
    draw: '🤝 تعادل',
    win_selected: (flag: string, team: string) => `فوز ${flag} *${team}* ✅`,
    score_prompt: (home: string, away: string) =>
      `الآن — ما هي النتيجة المتوقعة بالتحديد؟\n\n` +
      `اكتب النتيجة هكذا: *2-1*\n` +
      `(أهداف ${home} أولاً ثم ${away})\n\n` +
      `التوقع الصحيح للنتيجة = *25 نقطة* 🏆\n` +
      `توقع الفائز فقط = *10 نقاط*`,
    locked_in: (homeFlag: string, homeTeam: string, homeScore: number, awayScore: number, awayFlag: string, awayTeam: string) =>
      `🔒 *تم حفظ توقعك!*\n\n` +
      `${homeFlag} ${homeTeam} *${homeScore} – ${awayScore}* ${awayFlag} ${awayTeam}\n\n` +
      `بوستر المباراة في طريقه إليك... 📸`,
    auto_correct_note: (home: number, away: number) => `\n_(تم تعديل التوقع تلقائياً إلى ${home}-${away} للتعادل)_`,
    invalid_session: '⚠️ انتهت الجلسة. أرسل *توقع* أو *predict* للبدء مجدداً.',
    invalid_score_format: 'لم أتمكن من قراءة النتيجة. يرجى الكتابة مثل: *2-1*',
    invalid_score_consistency: 'النتيجة المدخلة لا تتطابق مع توقعك للفائز.',
    match_not_predictable: '⚠️ هذه المباراة لم تعد متاحة للتوقع. أرسل *predict* لعرض المباريات المتاحة.',
    already_predicted: (home: number, away: number) =>
      `✅ لقد قمت بتوقع هذه المباراة بالفعل!\n\n` +
      `توقعك: *${home} – ${away}*\n\n` +
      `أرسل *predict* لتوقع مباراة أخرى.`,
    no_matches: '⏳ لا توجد مباريات متاحة للتوقع حالياً. يفتح باب التوقع قبل ركلة البداية ببضع ساعات. ترقبوا!',
    predictions_not_open: (matchName: string, time: string, timeUntil: string) =>
      `⏳ التوقعات لم تفتح بعد.\n\n` +
      `المباراة القادمة: *${matchName}*\n` +
      `ركلة البداية: ${time} (بعد ${timeUntil})`,
    trouble_start_over: `تواجه مشكلة؟ لنبدأ من جديد. أرسل *predict* عندما تكون مستعداً.`,
    invalid_score_retry: (reason: string, home: string, away: string, attempt: number) =>
      `❌ ${reason}\n\n` +
      `يرجى كتابة النتيجة مجدداً مثل: *2-1*\n` +
      `(أهداف ${home} أولاً ثم ${away})\n\n` +
      `المحاولة ${attempt}/3`,
  },
};

export function getTranslation(lang: Language | string, key: string, ...args: any[]): string {
  const language: Language = ['en', 'ml', 'ar'].includes(lang) ? (lang as Language) : 'en';
  const val = TRANSLATIONS[language]?.[key] ?? TRANSLATIONS['en']?.[key] ?? key;
  if (typeof val === 'function') {
    return val(...args);
  }
  return val;
}
