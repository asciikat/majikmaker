'use strict';

// Sources below support the stated correspondences and ceremonial use. The
// strokes are conventional modern outlines, not transcriptions of printed
// glyphs or instructions for a complete invoking/banishing ritual. The period
// records the consulted attestation, not the invention of a symbol.
const HISTORY_TABLE_URL='https://github.com/jonnyg23/mahabrain/blob/main/sacred_obsidian_vault/oto/aba/app5.md';
const HISTORY_LIBER_O_URL='https://github.com/jonnyg23/mahabrain/blob/main/sacred_obsidian_vault/oto/libero.md';
const HISTORY_PERIOD='Early 20th-century attestation (777 / Liber O)';
const historyStroke=(path,instruction)=>({path,instruction});
const historySource=(title,url=HISTORY_TABLE_URL)=>({title,url});
const HISTORICAL_SYMBOLS=[
  {
    id:'fire',name:'Fire',tradition:'Western elemental correspondences',period:HISTORY_PERIOD,
    meaning:'The element fire. Crowley’s correspondence table assigns it the qualities hot and dry. This is its conventional triangular glyph.',
    source:historySource('Crowley, Magick, Appendix V, Table I, column XI; element Fire'),
    strokes:[historyStroke('M220 110 L330 310 L110 310 Z','Draw a closed upright triangle: top, lower right, lower left, then back to the top.')]
  },
  {
    id:'water',name:'Water',tradition:'Western elemental correspondences',period:HISTORY_PERIOD,
    meaning:'The element water. Crowley’s correspondence table assigns it the qualities cold and moist. This is its conventional downward triangular glyph.',
    source:historySource('Crowley, Magick, Appendix V, Table I, column XI; element Water'),
    strokes:[historyStroke('M110 130 L330 130 L220 330 Z','Draw a closed downward triangle: upper left, upper right, bottom, then back to the start.')]
  },
  {
    id:'air',name:'Air',tradition:'Western elemental correspondences',period:HISTORY_PERIOD,
    meaning:'The element air. Crowley’s correspondence table assigns it the qualities hot and moist. The conventional glyph is an upright triangle crossed by a bar.',
    source:historySource('Crowley, Magick, Appendix V, Table I, column XI; element Air'),
    strokes:[historyStroke('M220 110 L330 310 L110 310 Z','Draw a closed upright triangle.'),historyStroke('M165 210 L275 210','Draw a horizontal bar across its middle.')]
  },
  {
    id:'earth',name:'Earth',tradition:'Western elemental correspondences',period:HISTORY_PERIOD,
    meaning:'The element earth. Crowley’s correspondence table assigns it the qualities cold and dry. The conventional glyph is a downward triangle crossed by a bar.',
    source:historySource('Crowley, Magick, Appendix V, Table I, column XI; element Earth'),
    strokes:[historyStroke('M110 130 L330 130 L220 330 Z','Draw a closed downward triangle.'),historyStroke('M165 230 L275 230','Draw a horizontal bar across its middle.')]
  },
  {
    id:'sun',name:'Sun',tradition:'Western planetary correspondences',period:HISTORY_PERIOD,
    meaning:'The conventional solar glyph. In Crowley’s planetary table, the Sun corresponds to gold and the number 6; Liber O uses planetary sigils within hexagrams.',
    source:historySource('Crowley, Magick, Appendix V, Table III, columns LXXVII and LXXXI; Sun'),
    strokes:[historyStroke('M310 220 A90 90 0 1 1 130 220 A90 90 0 1 1 310 220','Draw a circle.'),historyStroke('M219.8 220 L220.2 220','Place a small dot at the center.')]
  },
  {
    id:'moon',name:'Moon',tradition:'Western planetary correspondences',period:HISTORY_PERIOD,
    meaning:'The conventional lunar crescent. In Crowley’s planetary table, the Moon corresponds to silver and the number 9; these are correspondences in his ceremonial system.',
    source:historySource('Crowley, Magick, Appendix V, Table III, columns LXXVII and LXXXI; Moon'),
    strokes:[historyStroke('M270 120 C100 130 100 310 270 320 C185 290 185 150 270 120 Z','Draw the outer curve from the top tip to the bottom tip, then curve back inside to close the crescent.')]
  },
  {
    id:'mercury',name:'Mercury',tradition:'Western planetary correspondences',period:HISTORY_PERIOD,
    meaning:'The conventional Mercury glyph. Crowley links Mercury with the metal mercury and number 8; Liber O associates it with the study of sciences as a ritual mnemonic.',
    source:historySource('Crowley, Magick, Appendix V, Table III; Mercury; see also Liber O II.2–5'),
    strokes:[historyStroke('M170 110 C170 175 270 175 270 110','Draw an upward-open crescent across the top.'),historyStroke('M270 205 A50 50 0 1 1 170 205 A50 50 0 1 1 270 205','Draw a circle below the crescent, touching its bottom.'),historyStroke('M220 255 L220 330','Extend a vertical stem down from the circle.'),historyStroke('M185 298 L255 298','Cross the stem with a short horizontal line.')]
  },
  {
    id:'venus',name:'Venus',tradition:'Western planetary correspondences',period:HISTORY_PERIOD,
    meaning:'The conventional Venus glyph. Crowley’s planetary table associates Venus with copper and the number 7.',
    source:historySource('Crowley, Magick, Appendix V, Table III, columns LXXVII and LXXXI; Venus'),
    strokes:[historyStroke('M280 185 A60 60 0 1 1 160 185 A60 60 0 1 1 280 185','Draw a circle in the upper half.'),historyStroke('M220 245 L220 335','Draw a vertical stem down from the circle.'),historyStroke('M180 295 L260 295','Cross the stem with a horizontal line.')]
  },
  {
    id:'mars',name:'Mars',tradition:'Western planetary correspondences',period:HISTORY_PERIOD,
    meaning:'The conventional Mars glyph. Crowley’s planetary table associates Mars with iron and the number 5.',
    source:historySource('Crowley, Magick, Appendix V, Table III, columns LXXVII and LXXXI; Mars'),
    strokes:[historyStroke('M265 255 A65 65 0 1 1 135 255 A65 65 0 1 1 265 255','Draw a circle below and to the left of the center.'),historyStroke('M246 209 L320 135','Draw a diagonal line from the circle toward the upper right.'),historyStroke('M262 135 L320 135 L320 193','Draw the arrowhead as a right angle at the top of the diagonal.')]
  },
  {
    id:'jupiter',name:'Jupiter',tradition:'Western planetary correspondences',period:HISTORY_PERIOD,
    meaning:'The conventional Jupiter glyph. Crowley’s planetary table associates Jupiter with tin and the number 4.',
    source:historySource('Crowley, Magick, Appendix V, Table III, columns LXXVII and LXXXI; Jupiter'),
    strokes:[historyStroke('M150 165 C150 110 245 105 230 175 C223 214 185 243 140 270 L310 270','Draw the curled upper arm down toward the lower left, then continue horizontally to the right.'),historyStroke('M260 130 L260 330','Draw a vertical line through the horizontal arm.')]
  },
  {
    id:'saturn',name:'Saturn',tradition:'Western planetary correspondences',period:HISTORY_PERIOD,
    meaning:'The conventional Saturn glyph. Crowley’s planetary table associates Saturn with lead and the number 3.',
    source:historySource('Crowley, Magick, Appendix V, Table III, columns LXXVII and LXXXI; Saturn'),
    strokes:[historyStroke('M175 110 L175 320','Draw a long vertical stem.'),historyStroke('M140 153 L225 153','Draw a short crossbar near its top.'),historyStroke('M175 235 C210 155 300 195 263 263 C235 317 249 340 290 310','From the middle of the stem, draw the arched shoulder down into a curling hook.')]
  },
  {
    id:'aries',name:'Aries',tradition:'Western zodiacal correspondences',period:HISTORY_PERIOD,
    meaning:'The conventional Aries glyph. Crowley’s zodiac table gives Mars as its ruling planet; Liber O uses the sigil of a zodiac sign in the hexagram of its ruler.',
    source:historySource('Crowley, Magick, Appendix V, Table V, columns CXXXVII–CXXXVIII; Aries'),
    strokes:[historyStroke('M220 325 L220 190 C220 110 120 110 130 190','Draw the central stem upward, then curl outward into the left horn.'),historyStroke('M220 190 C220 110 320 110 310 190','Draw the matching right horn from the top of the stem.')]
  },
  {
    id:'taurus',name:'Taurus',tradition:'Western zodiacal correspondences',period:HISTORY_PERIOD,
    meaning:'The conventional Taurus glyph. Crowley’s zodiac table gives Venus as its ruling planet.',
    source:historySource('Crowley, Magick, Appendix V, Table V, columns CXXXVII–CXXXVIII; Taurus'),
    strokes:[historyStroke('M290 255 A70 70 0 1 1 150 255 A70 70 0 1 1 290 255','Draw a circle in the lower half.'),historyStroke('M135 110 C135 210 305 210 305 110','Draw two upward horns as one broad U-shaped curve touching the top of the circle.')]
  },
  {
    id:'gemini',name:'Gemini',tradition:'Western zodiacal correspondences',period:HISTORY_PERIOD,
    meaning:'The conventional Gemini glyph. Crowley’s zodiac table gives Mercury as its ruling planet.',
    source:historySource('Crowley, Magick, Appendix V, Table V, columns CXXXVII–CXXXVIII; Gemini'),
    strokes:[historyStroke('M170 140 L170 300','Draw the left vertical line.'),historyStroke('M270 140 L270 300','Draw a parallel vertical line on the right.'),historyStroke('M125 120 Q220 165 315 120','Join the tops with a gently bowed horizontal curve.'),historyStroke('M125 320 Q220 275 315 320','Join the bottoms with the opposite bowed curve.')]
  },
  {
    id:'cancer',name:'Cancer',tradition:'Western zodiacal correspondences',period:HISTORY_PERIOD,
    meaning:'The conventional Cancer glyph. Crowley’s zodiac table gives the Moon as its ruling planet.',
    source:historySource('Crowley, Magick, Appendix V, Table V, columns CXXXVII–CXXXVIII; Cancer'),
    strokes:[historyStroke('M180 175 A30 30 0 1 1 120 175 A30 30 0 1 1 180 175 C195 112 275 105 315 150','Draw the upper-left loop, then continue into a curved tail toward the upper right.'),historyStroke('M260 265 A30 30 0 1 1 320 265 A30 30 0 1 1 260 265 C245 328 165 335 125 290','Draw the lower-right loop, then continue into a curved tail toward the lower left.')]
  },
  {
    id:'leo',name:'Leo',tradition:'Western zodiacal correspondences',period:HISTORY_PERIOD,
    meaning:'The conventional Leo glyph. Crowley’s zodiac table gives the Sun as its ruling planet.',
    source:historySource('Crowley, Magick, Appendix V, Table V, columns CXXXVII–CXXXVIII; Leo'),
    strokes:[historyStroke('M185 265 A30 30 0 1 1 125 265 A30 30 0 1 1 185 265 C175 210 175 130 235 125 C310 115 312 195 270 250 C230 300 267 343 312 302','Draw the lower-left loop, rise into a large arch, then curve down and finish with an upward curl.')]
  },
  {
    id:'virgo',name:'Virgo',tradition:'Western zodiacal correspondences',period:HISTORY_PERIOD,
    meaning:'The conventional Virgo glyph. Crowley’s zodiac table gives Mercury as its ruling planet.',
    source:historySource('Crowley, Magick, Appendix V, Table V, columns CXXXVII–CXXXVIII; Virgo'),
    strokes:[historyStroke('M105 285 L105 165 C105 120 165 120 165 165 L165 285 L165 165 C165 120 225 120 225 165 L225 285 L225 165 C225 120 285 120 285 165 L285 260 C285 305 305 325 335 330','Draw three rounded stems like a joined lowercase m, then curve the final stem down to the right.'),historyStroke('M285 200 C360 160 360 270 235 320','Draw a loop to the right of the last stem, crossing it as the loop returns toward the lower left.')]
  },
  {
    id:'libra',name:'Libra',tradition:'Western zodiacal correspondences',period:HISTORY_PERIOD,
    meaning:'The conventional Libra glyph. Crowley’s zodiac table gives Venus as its ruling planet.',
    source:historySource('Crowley, Magick, Appendix V, Table V, columns CXXXVII–CXXXVIII; Libra'),
    strokes:[historyStroke('M120 245 L175 245 C130 140 310 140 265 245 L320 245','Draw a horizontal shoulder, a raised rounded arch, and the matching shoulder on the right.'),historyStroke('M120 300 L320 300','Draw a separate horizontal line below.')]
  },
  {
    id:'scorpio',name:'Scorpio',tradition:'Western zodiacal correspondences',period:HISTORY_PERIOD,
    meaning:'The conventional Scorpio glyph. Crowley’s zodiac table gives Mars as its ruling planet, reflecting the traditional rulership used in that system.',
    source:historySource('Crowley, Magick, Appendix V, Table V, columns CXXXVII–CXXXVIII; Scorpio'),
    strokes:[historyStroke('M100 285 L100 165 C100 120 160 120 160 165 L160 285 L160 165 C160 120 220 120 220 165 L220 285 L220 165 C220 120 280 120 280 165 L280 275 C280 315 310 315 340 285','Draw three rounded stems like a joined lowercase m, then curve the last stem down and out to the right.'),historyStroke('M310 285 L340 285 L340 315','Finish the tail with a right-pointing arrowhead.')]
  },
  {
    id:'sagittarius',name:'Sagittarius',tradition:'Western zodiacal correspondences',period:HISTORY_PERIOD,
    meaning:'The conventional Sagittarius glyph. Crowley’s zodiac table gives Jupiter as its ruling planet.',
    source:historySource('Crowley, Magick, Appendix V, Table V, columns CXXXVII–CXXXVIII; Sagittarius'),
    strokes:[historyStroke('M130 310 L310 130','Draw a diagonal arrow shaft from lower left to upper right.'),historyStroke('M230 130 L310 130 L310 210','Draw its arrowhead as a right angle.'),historyStroke('M160 210 L230 280','Draw a short diagonal crossbar through the shaft.')]
  },
  {
    id:'capricorn',name:'Capricorn',tradition:'Western zodiacal correspondences',period:HISTORY_PERIOD,
    meaning:'One conventional Capricorn glyph variant. Crowley’s zodiac table gives Saturn as its ruling planet; historical and modern Capricorn letterforms vary.',
    source:historySource('Crowley, Magick, Appendix V, Table V, columns CXXXVII–CXXXVIII; Capricorn'),
    strokes:[historyStroke('M110 160 L150 265 L190 160 C215 115 245 135 245 195 L245 275 C245 320 220 335 200 315 C180 295 235 255 285 255 C345 255 345 175 300 175 C245 175 255 285 325 320','Draw the pointed left arm, arch into a descending stem, then form the crossing loop on the right.')]
  },
  {
    id:'aquarius',name:'Aquarius',tradition:'Western zodiacal correspondences',period:HISTORY_PERIOD,
    meaning:'The conventional Aquarius glyph. Crowley’s zodiac table gives Saturn as its ruling planet, reflecting traditional rulership.',
    source:historySource('Crowley, Magick, Appendix V, Table V, columns CXXXVII–CXXXVIII; Aquarius'),
    strokes:[historyStroke('M110 185 L150 145 L190 185 L230 145 L270 185 L310 145 L330 165','Draw a row of angular waves from left to right.'),historyStroke('M110 285 L150 245 L190 285 L230 245 L270 285 L310 245 L330 265','Draw a matching row of angular waves below.')]
  },
  {
    id:'pisces',name:'Pisces',tradition:'Western zodiacal correspondences',period:HISTORY_PERIOD,
    meaning:'The conventional Pisces glyph. Crowley’s zodiac table gives Jupiter as its ruling planet, reflecting traditional rulership.',
    source:historySource('Crowley, Magick, Appendix V, Table V, columns CXXXVII–CXXXVIII; Pisces'),
    strokes:[historyStroke('M135 115 C220 150 220 290 135 325','Draw the left curve, bowing inward toward the center.'),historyStroke('M305 115 C220 150 220 290 305 325','Draw its mirrored curve on the right.'),historyStroke('M125 220 L315 220','Connect both curves with a horizontal line across the middle.')]
  },
  {
    id:'vayu',name:'Vayu · circle',tradition:'Tattwa correspondences in Crowley',period:HISTORY_PERIOD,
    meaning:'In Crowley’s adapted tattwa table, Vayu corresponds to air and is described as a blue circle. The drawing shows its outline; the historical color is part of the stated correspondence.',
    source:historySource('Crowley, Magick, Appendix V, Table II, column LXXV; Vayu'),
    strokes:[historyStroke('M320 220 A100 100 0 1 1 120 220 A100 100 0 1 1 320 220','Draw one closed circle.')]
  },
  {
    id:'aupas',name:'Aupas · crescent',tradition:'Tattwa correspondences in Crowley',period:HISTORY_PERIOD,
    meaning:'Crowley’s tattwa table calls the water form “Aupas” and describes a silver crescent. This is an outline rendering of that named shape, not a claim about every Indian tradition.',
    source:historySource('Crowley, Magick, Appendix V, Table II, column LXXV; Aupas'),
    strokes:[historyStroke('M110 170 C110 370 330 370 330 170 C295 270 145 270 110 170 Z','Curve down from the left tip, around the bottom to the right tip, then back along the inner curve to close the crescent.')]
  },
  {
    id:'agni',name:'Agni / Tejas · triangle',tradition:'Tattwa correspondences in Crowley',period:HISTORY_PERIOD,
    meaning:'Crowley’s tattwa table associates fire with “Agni or Tejas,” described as a red triangle. Here the named shape is drawn as a simple outline.',
    source:historySource('Crowley, Magick, Appendix V, Table II, column LXXV; Agni or Tejas'),
    strokes:[historyStroke('M220 110 L330 310 L110 310 Z','Draw one closed upright triangle.')]
  },
  {
    id:'prithivi',name:'Prithivi · square',tradition:'Tattwa correspondences in Crowley',period:HISTORY_PERIOD,
    meaning:'Crowley’s tattwa table associates earth with Prithivi, described as a yellow square. Here the named shape is drawn as a simple outline.',
    source:historySource('Crowley, Magick, Appendix V, Table II, column LXXV; Prithivi'),
    strokes:[historyStroke('M125 125 L315 125 L315 315 L125 315 Z','Draw four equal sides in one continuous stroke to close a square.')]
  },
  {
    id:'akasa',name:'Akasa · egg',tradition:'Tattwa correspondences in Crowley',period:HISTORY_PERIOD,
    meaning:'Crowley’s tattwa table associates spirit with Akasa, described as a black egg. Here the named shape is drawn as an outline, with a narrower top and broader bottom.',
    source:historySource('Crowley, Magick, Appendix V, Table II, column LXXV; Akasa'),
    strokes:[historyStroke('M220 105 C267 105 315 206 315 265 C315 352 125 352 125 265 C125 206 173 105 220 105 Z','Draw an egg-shaped closed loop, narrow at the top and broad at the bottom.')]
  },
  {
    id:'pentagram',name:'Pentagram',tradition:'Western ceremonial figures',period:HISTORY_PERIOD,
    meaning:'A five-pointed star. Liber O uses pentagrams in elemental rituals; Appendix V also assigns the lineal figure pentagram to Mars. Those are contextual uses, not a single universal meaning.',
    source:historySource('Crowley, Liber O, IV, Lesser and Greater Rituals of the Pentagram',HISTORY_LIBER_O_URL),
    strokes:[historyStroke('M220 105 L290 320 L110 185 L330 185 L150 320 Z','Draw a five-pointed star continuously: top, lower right, upper left, upper right, lower left, and back to the top.')]
  },
  {
    id:'hexagram',name:'Hexagram',tradition:'Western ceremonial figures',period:HISTORY_PERIOD,
    meaning:'Two overlapping triangles form a six-pointed star. Liber O uses this form in planetary and zodiacal rituals; Appendix V lists the hexagram as the Sun’s lineal figure. Other traditions use it differently.',
    source:historySource('Crowley, Liber O, IV, Lesser and Greater Rituals of the Hexagram',HISTORY_LIBER_O_URL),
    strokes:[historyStroke('M220 100 L330 290 L110 290 Z','Draw a closed upright triangle.'),historyStroke('M220 340 L110 150 L330 150 Z','Draw a matching downward triangle overlapping the first.')]
  },
  {
    id:'octagram',name:'Octagram',tradition:'Western ceremonial figures',period:HISTORY_PERIOD,
    meaning:'An eight-pointed star. Liber O II associates the octagram with Mercury and describes an eight-pointed yellow star used to reinforce the idea of studying sciences. Shown here as two overlapping squares.',
    source:historySource('Crowley, Liber O, II.2–5; Mercury, octagram and ritual mnemonics',HISTORY_LIBER_O_URL),
    strokes:[historyStroke('M145 145 L295 145 L295 295 L145 295 Z','Draw a square.'),historyStroke('M220 114 L326 220 L220 326 L114 220 Z','Draw a second square turned diagonally across the first to make eight points.')]
  }
];

if(typeof module!=='undefined')module.exports={HISTORICAL_SYMBOLS};
