// Placeholder data only ([TEST]); no Sitainge forms. Run from repository root: node scripts/tests/website_core_test.js
globalThis.SitaingeItems = require('../../website/items.js');
const Core = require('../../website/core.js');
const { BLOCKS } = globalThis.SitaingeItems;
const state = { interviewId:'SIT-INT-20990101-TEST', consent:{adult:true,cc0:true,publish:'yes',credit:'anonymous',creditName:'',save:true,audio:'none'},
 speaker:{locality:'TEST-PLACE',age:'30-49',background:'',otherLanguages:'',languageName:'[TEST] name'},
 answers:{ 'people:0':{status:'used',response:'[TEST] "quoted" \u00e9 \u2028 form',variants:['[TEST] v1','[TEST] v2'],pron:'',usage:'',conf:'sure',comment:'line1\nline2'},
           'people:1':{status:'not_used',response:'typed text',variants:[],pron:'',usage:'',conf:'',comment:''},
           'sentences:0':{status:'',response:'[TEST] sentence',variants:[],pron:'',usage:'',conf:'fairly_sure',comment:''},
           'home:0':{status:'skipped'} },
 heritage:[{type:'proverb',original:'[TEST] saying',literal:'lit',meaning:'mean',context:'ctx',conf:''}], readBack:true };
Core.buildSubmission(state, BLOCKS, new Date('2099-01-01T00:00:00'), 'abcd').then(r=>{
  require('fs').writeFileSync(require('os').tmpdir()+'/web_submission.txt', r.text);
  console.log('errors:', r.errors, 'pii:', r.pii, 'items:', r.items.length, 'sha:', r.sha.slice(0,12));
});
