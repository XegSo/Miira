const rolesLevel = [
    '630980373374828544',
    '739111130034733108',
    '739111062682730507'
];

const mirageLogo = 'https://puu.sh/JP9Iw/a365159d0e.png';

const staffUserIds = [
    '337197857566228480',
    '260016245225684992',
    '675733770610933761',
    '280107437720076288',
    '133050854499418113',
    '203932549746130944',
    '212983149125304321',
    '752845997662666752',
    '687004886922952755',
    '959278677789663302',
    '969663617828020224'
];

const collabManagerRole = '1251338108084031599';

const earlyAccessRoles = new Set(['630636502187114496', '834962043735638016', '962251481669574666', '1146532857293045790', '1200147391765024859', '861679323739717642']);

const decayPremiumRoles = new Set(['963221388892700723', '767452000777535488', '1146645094699642890']);

const collabAdminsRoleID = '630636502187114496';

const unnecesaryFieldsOsu = [
    'default_group',
    'is_active',
    'is_bot',
    'is_deleted',
    'is_online',
    'pm_friends_only',
    'profile_colour',
    'discord',
    'has_supported',
    'interests',
    'location',
    'max_blocks',
    'max_friends',
    'occupation',
    'playstyle',
    'post_count',
    'profile_order',
    'title',
    'title_url',
    'twitter',
    'website',
    'country',
    'cover',
    'kudosu',
    'account_history',
    'active_tournament_banner',
    'active_tournament_banners',
    'beatmap_playcounts_count',
    'comments_count',
    'favourite_beatmapset_count',
    'graveyard_beatmapset_count',
    'groups',
    'guest_beatmapset_count',
    'loved_beatmapset_count',
    'mapping_follower_count',
    'monthly_playcounts',
    'nominated_beatmapset_count',
    'page',
    'pending_beatmapset_count',
    'previous_usernames',
    'ranked_beatmapset_count',
    'replays_watched_counts',
    'scores_best_count',
    'scores_first_count',
    'scores_pinned_count',
    'scores_recent_count',
    'support_level',
    'user_achievements',
    'rank_history',
    'rankHistory',
    'ranked_and_approved_beatmapset_count',
    'unranked_beatmapset_count'
];

const skillRanksByScore = [
    { rank: 'X', value: 1500 },
    { rank: 'S', value: 800 },
    { rank: 'A', value: 450 },
    { rank: 'B', value: 250 },
    { rank: 'C', value: 150 },
    { rank: 'D', value: 75 },
    { rank: 'F', value: 0 }
];

const necesaryFieldsTop100 = [
    'position',
    'mods_id',
    'created_at',
    'mods',
    'pp',
    'rank'
];

const channelCreationActions = [
    'Avatar GFX Commission',
    'Previous Megacollab Avatar',
    'Banner GFX Commission',
    'Previous Megacollab Banner',
    'Overlay GFX Commission',
    'Endless Mirage Skin'
];

const rolesToRemove = [

];

const badgeNames = [

];

const prestigeRolesIDs = [
    '963258467928408134',
    '963258497376583780',
    '963258518767534080',
    '963258542930931732',
    '963258567425658910',
    '963258579165524008',
    '1071824409012219994',
    '1146532857293045790',
    '1200147391765024859'
];

const paypal = 'https://www.paypal.me/xegEM/';

const kofi = 'https://ko-fi.com/zhyne/';

const shopItems = [
    { name: 'Tokens Boost X2 72h', value: '4,000 ₥', value_int: 4000, id: 'tokens-boost', desc: 'Obtain a X2 Token Boost per message sent in the next 72h.', class: 'Augments', isReturnable: false }, // Coded
    { name: 'Novice Active Member Role', value: '5,000 ₥', value_int: 5000, id: 'active-novice-role', desc: 'Obtain a role in the server that displays you\'re an active user along with a badge for all of your future collab materials.', class: 'Roles', isReturnable: false }, // Coded
    { name: 'Avatar GFX Commission', value: '10,000 ₥', value_int: 10000, id: 'avatar-com', desc: 'Request a custom Avatar GFX Commission.', class: 'Commissions', isReturnable: false }, // Coded
    { name: 'Advanced Active Member Role', value: '20,000 ₥', value_int: 20000, id: 'active-advanced-role', desc: 'Obtain a role in the server that displays you\'re an active user along with a badge for all of your future collab materials.', class: 'Roles', isReturnable: false }, // Coded
    { name: 'Premium Avatar', value: '50,000 ₥', value_int: 50000, id: 'mirage-one', desc: 'Be able to claim the Premium Avatar perk for one collab.', class: 'Collab Perks', isReturnable: false }, // Coded
    { name: 'Premium Cover', value: '80,000 ₥', value_int: 80000, id: 'premium-cover', desc: 'Be able to claim the Premium Cover perk for one collab.', class: 'Collab Perks', isReturnable: false }, // Coded
    { name: 'Premium Signature', value: '80,000 ₥', value_int: 80000, id: 'premium-signature', desc: 'Be able to claim the Premium Signature perk for one collab.', class: 'Collab Perks', isReturnable: false }, // Coded
    { name: 'Premium Desktop Wallpaper', value: '100,000 ₥', value_int: 100000, id: 'premium-wallpaper', desc: 'Be able to claim the Premium Wallpaper perk for one collab.', class: 'Collab Perks', isReturnable: false }, // Coded
    { name: 'Extra Collab Materials', value: '200,000 ₥', value_int: 200000, id: 'premium-extra', desc: 'Be able to claim the Extra Materials perk for one collab.', class: 'Collab Perks', isReturnable: false }, // Coded
    { name: 'Previous Megacollab Avatar', value: '50,000 ₥', value_int: 50000, id: 'avatar-collab-pre', desc: 'Obtain a customized Megacollab avatar with any of the previous designs.', class: 'Commissions', isReturnable: false }, // Coded
    { name: 'Banner GFX Commission', value: '70,000 ₥', value_int: 70000, id: 'banner-com', desc: 'Request a custom Banner GFX Commission.', class: 'Commissions', isReturnable: false }, // Coded
    { name: 'Previous Megacollab Banner', value: '70,000 ₥', value_int: 70000, id: 'banner-collab-pre', desc: 'Obtain a customized Megacollab banner with any of the previous designs.', class: 'Commissions', isReturnable: false }, // Coded
    { name: 'Overlay GFX Commission', value: '80,000 ₥', value_int: 80000, id: 'overlay-com', desc: 'Request a custom Stream Overlay GFX Commission.', class: 'Commissions', isReturnable: false }, // Coded
    { name: 'Ultimate Active Member Role', value: '80,000 ₥', value_int: 80000, id: 'active-ultimate-role', desc: 'Obtain a role on top of the server that displays you\'re an active user along with a special badge for all of your future collab materials.', class: 'Roles', isReturnable: false }, // Coded
    { name: 'Endless Mirage Skin', value: '200,000 ₥', value_int: 200000, id: 'mirage-skin', desc: 'Obtain the current Megacollab\'s skin customized with your name and images.', class: 'Collab Perks', isReturnable: false }, // Coded
    { name: 'Collab Early Access', value: '800,000 ₥', value_int: 800000, id: 'early-access', desc: 'Obtain Early Access for the next megacollab.', class: 'Collab Perks', isReturnable: false },
    { name: 'Permanent X2 Boost', value: '300,000 ₥', value_int: 300000, id: 'perma-boost', desc: 'Obtain a permanent X2 Token Boost per message sent.', class: 'Augments', isReturnable: false }, // Coded
    { name: 'Global Boost', value: '300,000 ₥', value_int: 300000, id: 'global-boost', desc: 'Set a global boost of X4 tokens for 24 Hours.', class: 'Augments', isReturnable: false }, // Coded
    { name: 'Prestige Boost', value: '800,000 ₥', value_int: 800000, id: 'prestige-boost', desc: 'Get +1 Prestige Level.', class: 'Collab Perks', isReturnable: false }, // Coded
    { name: 'Owner\'s maid suit pics', value: '10,000,000 ₥', value_int: 10000000000, id: 'feet', desc: 'owo', class: 'Extra', isReturnable: false } // Coded
    // Add more items as needed, ensuring each item is an object with 'name' and 'value'
];

const nonPurchaseableBackgrounds = [
    { name: 'Prestige Background', value: 'Obtained by participating on collabs.', id: 'pres-bg', desc: 'Special prestige profile cosmetic obtained by participating on collabs.', class: 'Cosmetics', type: 'background', isReturnable: true },
    { name: 'Prestige Background Plus', value: 'Obtained by participating on 3+ collabs.', id: 'pres-bg-plus', desc: 'Special prestige profile cosmetic obtained by participating more than 3 collabs.', class: 'Cosmetics', type: 'background', isReturnable: true },
    { name: 'Premium Background', value: 'Obtained by purchasing premium.', id: 'premium-bg', desc: 'Special **premium** profile cosmetic.', class: 'Cosmetics', type: 'background', isReturnable: true },
    { name: 'Premium Background Plus', value: 'Obtained by purchasing a high premium tier.', id: 'premium-bg-plus', desc: 'Special **premium plus** profile cosmetic.', class: 'Cosmetics', type: 'background', isReturnable: true },
    { name: 'Staff Background', value: 'Obtained by being staff.', id: 'staff-bg', desc: 'Special profile cosmetic for staff.', class: 'Cosmetics', type: 'background', isReturnable: true }
];

const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const colorRoles = [
    '1252031663861534780',
    '631269379782213632',
    '659647201336623125',
    '693846687092834314',
    '659647199512100864',
    '1252032203521654804',
    '693829790402084954',
    '659646724045799435',
    '659649757769236490',
    '659647200535773184',
    '971224263732396132',
    '1252031985325707395',
    '1252032716229050424',
    '971224715077238886',
    '1252032900577103973'
];

const premiumTiers = [
    {
        name: 'Mirage I',
        id: 1,
        description: 'Starter premium role with 2 perks, both tied to the megacollabs.',
        roleId: '963221388892700723',
        cost: 5,
        generalRenewalPrice: 2,
        deluxePrice: 2,
        deluxeExtraPrice: 2,
        perks: [
            {
                name: 'Premium Avatar',
                avname: 'Premium Avatar',
                description: 'Obtain a special desgined avatar for the current collab.',
                restrictions: 'Only same picked character in the collab.',
                renewalPrice: 1,
                individualPrice: 5,
                singleUse: true,
                collabDependant: true,
                tier: 1
            },
            {
                name: 'Premium Cover',
                avname: 'Premium Cover',
                description: 'Obtain a special designed profile cover for your osu! profile.',
                restrictions: 'Only same picked character in the collab.',
                renewalPrice: 1,
                individualPrice: 5,
                singleUse: true,
                collabDependant: true,
                tier: 1
            }
        ],
        decay: true,
        extra: 'This tier includes bump inmunity, a special profile cosmetic for the server and a special badge for the osu! me section.'
    },
    {
        name: 'Mirage II',
        id: 2,
        description: 'This tier includes more extra materials, tied to the megacollabs.',
        roleId: '767452000777535488',
        cost: 10,
        generalRenewalPrice: 4,
        deluxePrice: 2,
        deluxeExtraPrice: 2,
        perks: [
            {
                name: 'Premium Animated Banner',
                avname: 'Animated Banner',
                description: 'Obtain a special animated banner for your me! section.',
                restrictions: 'Any character can be used.',
                renewalPrice: 2,
                individualPrice: 10,
                singleUse: true,
                collabDependant: true,
                tier: 2
            },
            {
                name: 'Premium Forum Signature',
                avname: 'Forum Signature',
                description: 'Obtain a special signature, usable in the osu! forums.',
                restrictions: 'Any character can be used.',
                renewalPrice: 2,
                individualPrice: 10,
                singleUse: true,
                collabDependant: true,
                tier: 2
            }
        ],
        decay: true,
        extra: 'This tier includes bump inmunity, a special profile cosmetic for the server and a special badge for the osu! me section.'
    },
    {
        name: 'Mirage III',
        id: 3,
        description: 'This tier includes more extra materials, tied to the megacollabs.',
        roleId: '1146645094699642890',
        cost: 15,
        generalRenewalPrice: 6,
        deluxePrice: 2,
        deluxeExtraPrice: 2,
        perks: [
            {
                name: 'Premium Animated Stream Overlay',
                avname: 'Stream Overlay',
                description: 'Obtain a special animated stream overlay.',
                restrictions: 'Images and fields will have restrictions by the design itself.',
                renewalPrice: 6,
                individualPrice: 15,
                singleUse: true,
                collabDependant: true,
                tier: 3
            },
            {
                name: 'Premium Desktop Wallpaper',
                avname: 'Desktop Wallpaper',
                description: 'Obtain a special desktop wallpaper.',
                restrictions: 'Any character can be used.',
                renewalPrice: 2,
                individualPrice: 10,
                singleUse: true,
                collabDependant: true,
                tier: 3
            },
            {
                name: 'Premium Collab Poster',
                avname: 'Collab Poster',
                description: 'Obtain a printable poster of the current megacollab.',
                restrictions: 'Any character can be used.',
                renewalPrice: 2,
                individualPrice: 10,
                singleUse: true,
                collabDependant: true,
                tier: 3
            }
        ],
        decay: true,
        extra: 'This tier includes bump inmunity, a special profile cosmetic for the server and a special badge for the osu! me section.'
    },
    {
        name: 'Mirage IV',
        id: 4,
        description: 'This tier includes early delivery for the collabs, along no premium decay after collabs.',
        roleId: '787388728795987969',
        cost: 20,
        generalRenewalPrice: 4,
        deluxePrice: 2,
        deluxeExtraPrice: 2,
        perks: [
            {
                name: 'Early Collab Delivery',
                description: 'Obtain the collab materials before public release.',
                restrictions: 'At least 1 week before and only applies for main collab materials.',
                renewalPrice: null,
                individualPrice: null,
                singleUse: false,
                collabDependant: false,
                tier: 4
            }
        ],
        decay: false,
        extra: 'This tier includes bump inmunity, no premium role decay, a special profile cosmetic for the server and a special badge for the osu! me section.'
    },
    {
        name: 'Mirage V',
        id: 5,
        description: 'This tier includes a customized osu! skin and an extra set of collab materials.',
        roleId: '787388721255153694',
        cost: 40,
        generalRenewalPrice: 16,
        deluxePrice: 1,
        deluxeExtraPrice: 1,
        perks: [
            {
                name: 'Megacollab Themed osu! skin',
                avname: 'osu! skin',
                description: 'Obtain the collab\'s osu! skin customized for you.',
                restrictions: 'Any character and texts can be used.',
                renewalPrice: 10,
                individualPrice: 20,
                singleUse: true,
                collabDependant: true,
                tier: 5
            },
            {
                name: 'Extra Collab Materials',
                avname: 'Extra Materials',
                description: 'Obtain an extra set of the current megacollab materials.',
                restrictions: 'Any character can be used.',
                renewalPrice: 10,
                individualPrice: 20,
                singleUse: true,
                collabDependant: true,
                tier: 5
            }
        ],
        decay: false,
        extra: 'This tier includes bump inmunity, no premium role decay, a special profile cosmetic for the server and a special badge for the osu! me section.'
    },
    {
        name: 'Mirage VI',
        id: 6,
        description: 'This tier includes early access to the collabs, access to the PSD templates and access to the staff chat.',
        roleId: '787723186556108840',
        cost: 100,
        generalRenewalPrice: 20,
        deluxePrice: 1,
        deluxeExtraPrice: 1,
        perks: [
            {
                name: 'Megacollab Early Access',
                avname: 'Early Access',
                description: 'Pick a character for the collab before the public opening.',
                restrictions: null,
                renewalPrice: 15,
                individualPrice: 60,
                singleUse: true,
                collabDependant: false,
                tier: 6
            },
            {
                name: 'Access to PSD templates',
                description: 'Get access to all the PSD templates of all of the megacollabs.',
                restrictions: null,
                renewalPrice: null,
                individualPrice: null,
                singleUse: false,
                collabDependant: false,
                tier: 6
            },
            {
                name: 'Access to the staff chat',
                description: 'Get direct contact with the server staff.',
                restrictions: null,
                renewalPrice: null,
                individualPrice: null,
                singleUse: false,
                collabDependant: false,
                tier: 6
            }
        ],
        decay: false,
        extra: 'This tier includes bump inmunity, no premium role decay, a special profile cosmetic for the server and a special badge for the osu! me section.'
    },
    {
        name: 'Mirage VII',
        id: 7,
        description: 'This tier doesn\'t need to renew perks bellow it, gets a customized Endless Mirage Hoodie, can host their own megacollab with us, has direct megacollab pool influence and has free access to the deluxe collabs.',
        roleId: '861679323739717642',
        cost: 250,
        generalRenewalPrice: null,
        deluxePrice: null,
        deluxeExtraPrice: null,
        perks: [
            {
                name: 'No Perk Renewal',
                description: 'No renewal for all of the premium perks bellow this tier.',
                restrictions: null,
                renewalPrice: null,
                individualPrice: null,
                singleUse: false,
                collabDependant: false,
                tier: 7
            },
            {
                name: 'Custom Endless Mirage Hoodie',
                avname: 'Endless Mirage Hoodie',
                description: 'Obtain an Endless Mirage themed hoodie with your name on it.',
                restrictions: null,
                renewalPrice: 20,
                individualPrice: 30,
                singleUse: true,
                collabDependant: false,
                tier: 7
            },
            {
                name: 'Host your own Megacollab',
                avname: 'Host a Megacollab',
                description: 'Host your own megacollab with designs made by us.',
                restrictions: null,
                renewalPrice: 50,
                individualPrice: 150,
                singleUse: true,
                collabDependant: false,
                tier: 7
            },
            {
                name: 'Megacollab Pooling Influence',
                description: 'Add any series that you would like into the collab.',
                restrictions: 'Series need to fit the topic of the collab.',
                renewalPrice: null,
                individualPrice: null,
                singleUse: false,
                collabDependant: false,
                tier: 7
            }
        ],
        decay: false,
        extra: 'This tier includes bump inmunity, no premium role decay, a special profile cosmetic for the server and a special badge for the osu! me section.'
    }
];

const premiumPerks = [
    {
        name: 'Premium Avatar',
        avname: 'Premium Avatar',
        description: 'Obtain a special desgined avatar for the current collab.',
        restrictions: 'Only same picked character in the collab.',
        renewalPrice: 1,
        individualPrice: 5,
        singleUse: true,
        collabDependant: true,
        tier: 1,
        fields: [
            {
                title: 'Name Text',
                placeholder: 'Typically your username.',
                name: 'av_name',
                type: 'text'
            }
        ]
    },
    {
        name: 'Premium Cover',
        avname: 'Premium Cover',
        description: 'Obtain a special designed profile cover for your osu! profile.',
        restrictions: 'Only same picked character in the collab.',
        renewalPrice: 1,
        individualPrice: 5,
        singleUse: true,
        collabDependant: true,
        tier: 1,
        fields: [
            {
                title: 'Name Text',
                placeholder: 'Typically your username.',
                name: 'co_name',
                type: 'text'
            },
            {
                title: 'Quote Text',
                placeholder: 'A quote for your Cover.',
                name: 'co_quote',
                type: 'text'
            }
        ]
    },
    {
        name: 'Premium Animated Banner',
        avname: 'Animated Banner',
        description: 'Obtain a special animated banner for your me! section.',
        restrictions: 'Any character can be used.',
        renewalPrice: 2,
        individualPrice: 10,
        singleUse: true,
        collabDependant: true,
        tier: 2,
        fields: [
            {
                title: 'Name Text',
                placeholder: 'Typically your username.',
                name: 'ca_name',
                type: 'text'
            },
            {
                title: 'Quote Text',
                placeholder: 'A quote for your Banner.',
                name: 'ca_quote',
                type: 'text'
            }
        ]
    },
    {
        name: 'Premium Forum Signature',
        avname: 'Forum Signature',
        description: 'Obtain a special signature, usable in the osu! forums.',
        restrictions: 'Any character can be used.',
        renewalPrice: 2,
        individualPrice: 10,
        singleUse: true,
        collabDependant: true,
        tier: 2,
        fields: [
            {
                title: 'Name Text',
                placeholder: 'Typically your username.',
                name: 'si_name',
                type: 'text'
            },
            {
                title: 'Quote Text',
                placeholder: 'A quote for your Signature.',
                name: 'si_quote',
                type: 'text'
            }
        ]
    },
    {
        name: 'Premium Animated Stream Overlay',
        avname: 'Stream Overlay',
        description: 'Obtain a special animated stream overlay.',
        restrictions: 'Images and fields will have restrictions by the design itself.',
        renewalPrice: 6,
        individualPrice: 15,
        singleUse: true,
        collabDependant: true,
        tier: 3,
        fields: [
            {
                title: 'Name Text',
                placeholder: 'The text that will appear in the name field.',
                name: 'ov_name',
                type: 'text'
            },
            {
                title: 'Quote Text',
                placeholder: 'A quote for your Overlay.',
                name: 'ov_quote',
                type: 'text'
            },
            {
                title: 'Character Main Image URL',
                placeholder: 'Transparent with no cuts.',
                name: 'ov_img_main',
                type: 'url'
            },
            {
                title: 'Character Accent Image URL',
                placeholder: 'Can have a background.',
                name: 'ov_img_accent',
                type: 'url'
            }
        ]
    },
    {
        name: 'Premium Desktop Wallpaper',
        avname: 'Desktop Wallpaper',
        description: 'Obtain a special desktop wallpaper.',
        restrictions: 'Any character can be used.',
        renewalPrice: 2,
        individualPrice: 10,
        singleUse: true,
        collabDependant: true,
        tier: 3,
        fields: [
            {
                title: 'Name Text',
                placeholder: 'The text that will appear in the name field.',
                name: 'wa_name',
                type: 'text'
            },
            {
                title: 'Quote Text',
                placeholder: 'A quote for your Wallpaper.',
                name: 'wa_quote',
                type: 'text'
            },
            {
                title: 'Character Main Image URL',
                placeholder: 'Transparent with no cuts.',
                name: 'wa_img_main',
                type: 'url'
            },
            {
                title: 'Character Accent Image URL',
                placeholder: 'Can have a background.',
                name: 'wa_img_accent',
                type: 'url'
            }
        ]
    },
    {
        name: 'Premium Collab Poster',
        avname: 'Collab Poster',
        description: 'Obtain a printable poster of the current megacollab.',
        restrictions: 'Any character can be used.',
        renewalPrice: 2,
        individualPrice: 10,
        singleUse: true,
        collabDependant: true,
        tier: 3,
        fields: [
            {
                title: 'Quote Text',
                placeholder: 'A quote for your poster.',
                name: 'po_quote',
                type: 'text'
            },
            {
                title: 'Character Main Image URL',
                placeholder: 'Transparent with no cuts.',
                name: 'po_img_main',
                type: 'url'
            },
            {
                title: 'Character Accent Image URL',
                placeholder: 'Can have a background.',
                name: 'po_img_accent',
                type: 'url'
            }
        ]
    },
    {
        name: 'Early Collab Delivery',
        description: 'Obtain the collab materials before public release.',
        restrictions: 'At least 1 week before and only applies for main collab materials.',
        renewalPrice: null,
        individualPrice: null,
        singleUse: false,
        collabDependant: false,
        tier: 4
    },
    {
        name: 'Megacollab Themed osu! skin',
        avname: 'osu! skin',
        description: 'Obtain the collab\'s osu! skin customized for you.',
        restrictions: 'Any character and texts can be used.',
        renewalPrice: 10,
        individualPrice: 20,
        singleUse: true,
        collabDependant: true,
        tier: 5,
        fields: [
            {
                title: 'Name Text',
                placeholder: 'The text that will appear in the name field.',
                name: 'sk_name',
                type: 'text'
            },
            {
                title: 'Quote Text',
                placeholder: 'A quote for your skin.',
                name: 'sk_quote',
                type: 'text'
            },
            {
                title: 'Character Main Image URL',
                placeholder: 'Transparent with no cuts.',
                name: 'sk_img_main',
                type: 'url'
            },
            {
                title: 'Character Accent Image URL',
                placeholder: 'Can have a background.',
                name: 'sk_img_accent',
                type: 'url'
            }
        ]
    },
    {
        name: 'Extra Collab Materials',
        avname: 'Extra Materials',
        description: 'Obtain an extra set of the current megacollab materials.',
        restrictions: 'Any character can be used.',
        renewalPrice: 10,
        individualPrice: 20,
        singleUse: true,
        collabDependant: true,
        tier: 5,
        fields: [
            {
                title: 'Avatar Text',
                placeholder: 'Typically your name.',
                name: 'av_name',
                type: 'text'
            },
            {
                title: 'Banner Text',
                placeholder: 'Typically your name.',
                name: 'ca_name',
                type: 'text'
            },
            {
                title: 'Banner Quote',
                placeholder: 'Quote for your banner.',
                name: 'ca_quote',
                type: 'text'
            },
            {
                title: 'Avatar Image URL',
                placeholder: 'Transparent PNG only.',
                name: 'av_img',
                type: 'url'
            },
            {
                title: 'Banner Image URL',
                placeholder: 'Transparent PNG only.',
                name: 'ca_img',
                type: 'url'
            }
        ]
    },
    {
        name: 'Megacollab Early Access',
        avname: 'Early Access',
        description: 'Pick a character for the collab before the public opening.',
        restrictions: null,
        renewalPrice: 15,
        individualPrice: 60,
        singleUse: true,
        collabDependant: false,
        tier: 6
    },
    {
        name: 'Access to PSD templates',
        description: 'Get access to all the PSD templates of all of the megacollabs.',
        restrictions: null,
        renewalPrice: null,
        individualPrice: null,
        singleUse: false,
        collabDependant: false,
        tier: 6
    },
    {
        name: 'Access to the staff chat',
        description: 'Get direct contact with the server staff.',
        restrictions: null,
        renewalPrice: null,
        individualPrice: null,
        singleUse: false,
        collabDependant: false,
        tier: 6
    },
    {
        name: 'No Perk Renewal',
        description: 'No renewal for all of the premium perks bellow this tier.',
        restrictions: null,
        renewalPrice: null,
        individualPrice: null,
        singleUse: false,
        collabDependant: false,
        tier: 7
    },
    {
        name: 'Custom Endless Mirage Hoodie',
        avname: 'Endless Mirage Hoodie',
        description: 'Obtain an Endless Mirage themed hoodie with your name on it.',
        restrictions: null,
        renewalPrice: 20,
        individualPrice: 30,
        singleUse: true,
        collabDependant: false,
        tier: 7
    },
    {
        name: 'Host your own Megacollab',
        avname: 'Host a Megacollab',
        description: 'Host your own megacollab with designs made by us.',
        restrictions: null,
        renewalPrice: 50,
        individualPrice: 150,
        singleUse: true,
        collabDependant: false,
        tier: 7
    },
    {
        name: 'Megacollab Pooling Influence',
        description: 'Add any series that you would like into the collab.',
        restrictions: 'Series need to fit the topic of the collab.',
        renewalPrice: null,
        individualPrice: null,
        singleUse: false,
        collabDependant: false,
        tier: 7
    }
];

const MirageFormat = Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

const suggestionChannelID = '880953549561954314';
const imageSwapChannelID = '1241221376833228800';
const auditLogChannelID = '1243646608176840846';
const userActionsLogChannelID = '1243692051347017848';
const reportsLogChannelID = '1248040971413880953';

const botId = '959278677789663302';
const guildId = '630281137998004224';

const timeInterval = 5000; // Define the time interval in milliseconds
const blacklistedChannels = ['630995793670701065', '746040634548289606', '1118649160858599487', '781152261023596584', '795652942299791370'];
const comboInterval = 8 * 60 * 1000; // 8 minutes in milliseconds
const blacklistedChars = ['>', '<', '??', 't!', 'http', '!', ':']; // Add any characters you want to blacklist here
const welcomeChannelID = '713108912764616704';
const logChannelID = '1197205849572126861';

// Schedule the daily decay to run at a specific time (e.g., 2:00 AM UTC)
const dailyCheckHour = 0; // Adjust this as needed
const dailyCheckMinute = 0;

const startingSubDay = 1;
const finalSubDay = 5;

module.exports = {
    decayPremiumRoles,
    badgeNames,
    reportsLogChannelID,
    userActionsLogChannelID,
    auditLogChannelID,
    startingSubDay,
    finalSubDay,
    logChannelID,
    rolesLevel,
    staffUserIds,
    romanNumerals,
    rolesToRemove,
    shopItems,
    MirageFormat,
    suggestionChannelID,
    botId,
    premiumTiers,
    guildId,
    colorRoles,
    timeInterval,
    blacklistedChannels,
    comboInterval,
    nonPurchaseableBackgrounds,
    blacklistedChars,
    welcomeChannelID,
    dailyCheckHour,
    dailyCheckMinute,
    channelCreationActions,
    paypal,
    kofi,
    premiumPerks,
    unnecesaryFieldsOsu,
    necesaryFieldsTop100,
    skillRanksByScore,
    prestigeRolesIDs,
    mirageLogo,
    imageSwapChannelID,
    collabAdminsRoleID,
    earlyAccessRoles,
    collabManagerRole
};
